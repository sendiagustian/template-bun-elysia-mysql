import mysql from "mysql2/promise";
import os from "os";
import { decode } from "../utils/decrypt";

let db: mysql.Pool | null = null;

function getIntEnv(name: string, def: number): number {
    const v = process.env[name];
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : def;
}

export function getDatabase(): mysql.Pool {
    if (db) return db;

    const host = process.env.DB_HOST!;
    const port = getIntEnv("DB_PORT", 3306);
    const user = decode(process.env.DB_USER!);
    const pass = decode(process.env.DB_PASS!);
    const name = process.env.DB_NAME!;

    if (!host || !port || !user || !pass || !name) {
        throw new Error("Missing database environment variables");
    }

    // Pool size adaptif: 4 × jumlah core (max 64), override via env POOL_MAX
    const cpu = Math.max(1, os.cpus()?.length || 1);
    const poolMaxDefault = Math.min(64, cpu * 4);
    const connectionLimit = getIntEnv("POOL_MAX", poolMaxDefault);
    const maxIdle = Math.min(connectionLimit, getIntEnv("POOL_MAX_IDLE", Math.ceil(connectionLimit / 2)));

    const poolConfig: mysql.PoolOptions = {
        host,
        port,
        user,
        password: pass,
        database: name,

        // --- Tuning inti ---
        connectionLimit, // total koneksi simultan ke DB
        waitForConnections: true, // antre kalau penuh (bukan melempar error langsung)
        queueLimit: 0, // 0 = tanpa batas; set angka (mis. 1000) kalau ingin fail-fast saat antrean panjang
        connectTimeout: 30000, // ms: batas buat establish TCP handshake (ditingkatkan untuk koneksi remote)
        // Idle management (butuh mysql2 v3.6+)
        maxIdle, // koneksi idle yang dipertahankan
        idleTimeout: 60_000, // ms: tutup koneksi idle > 60s (kurangi burn resource)

        // --- Stabilitas & correctness ---
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // SSL configuration untuk koneksi remote yang aman (commented out jika tidak diperlukan)
        // ssl: { rejectUnauthorized: false }, // Uncomment jika server memerlukan SSL
        supportBigNumbers: true, // kolom DECIMAL/NUMERIC jadi number (lihat bigNumberStrings)
        bigNumberStrings: false, // true jika perlu string untuk angka sangat besar (hindari precision loss)
        decimalNumbers: true, // DECIMAL -> number (hati2 jika butuh presisi finansial penuh)
        dateStrings: true, // tanggal sebagai string (hindari konversi TZ mengejutkan)
        timezone: "Z", // simpan/ambil dalam UTC
        namedPlaceholders: true, // dukung :name placeholder
        charset: "utf8mb4", // emoji-safe
        // Optional: kompresi (berguna bila jarak jaringan/latency tinggi)
        // compress: true,
        // Optional: set variable sesi (mis. mode SQL)
        // sessionVariables: { sql_mode: 'NO_ENGINE_SUBSTITUTION', wait_timeout: 60 }
    };

    db = mysql.createPool(poolConfig);

    // (Opsional) warm-up: buka beberapa koneksi & ping agar pool siap
    void (async () => {
        const warm = Math.min(4, connectionLimit);
        const conns = await Promise.all(Array.from({ length: warm }, () => db!.getConnection()));
        try {
            await Promise.all(conns.map((c) => c.ping()));
        } finally {
            conns.forEach((c) => c.release());
        }
    })();

    // (Opsional) log antrian (untuk debug backpressure)
    // @ts-ignore
    db.on?.("enqueue", () => {
        // console.warn("[DB] Pool queue is growing (consider raising POOL_MAX or reducing concurrency)");
    });

    return db;
}

// Helper execute dengan timeout per query (fail-fast)
export async function executeQuery<T = any>(
    query: string,
    params: any[] | Record<string, any> = [],
    timeoutMs = getIntEnv("DB_QUERY_TIMEOUT_MS", 1000) // default 1s
): Promise<T[]> {
    const pool = getDatabase();
    const [rows] = await pool.execute({ sql: query, values: params, timeout: timeoutMs });
    return rows as T[];
}

export async function executeQuerySingle<T = any>(
    query: string,
    params: any[] | Record<string, any> = [],
    timeoutMs?: number
): Promise<T | null> {
    const results = await executeQuery<T>(query, params, timeoutMs);
    return results.length > 0 ? results[0] : null;
}

// Transaction dengan timeout ketat per statement
export async function withTransaction<T>(
    callback: (
        conn: mysql.PoolConnection,
        q: <R = any>(sql: string, p?: any, tmo?: number) => Promise<R[]>
    ) => Promise<T>
): Promise<T> {
    const pool = getDatabase();
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const q = async <R = any>(
            sql: string,
            p: any = [],
            tmo = getIntEnv("DB_TX_QUERY_TIMEOUT_MS", 2000)
        ): Promise<R[]> => {
            const [rows] = await conn.execute({ sql, values: p, timeout: tmo });
            return rows as R[];
        };

        const result = await callback(conn, q);
        await conn.commit();
        return result;
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}

// Test koneksi database dengan detailed error reporting
export async function testDatabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
        const pool = getDatabase();
        console.log("[DB] Testing database connection...");

        const start = Date.now();
        const connection = await pool.getConnection();
        const connectTime = Date.now() - start;

        console.log(`[DB] Connection acquired in ${connectTime}ms`);

        try {
            const pingStart = Date.now();
            await connection.ping();
            const pingTime = Date.now() - pingStart;

            console.log(`[DB] Ping successful in ${pingTime}ms`);

            // Test simple query
            const queryStart = Date.now();
            await connection.execute("SELECT 1 as test");
            const queryTime = Date.now() - queryStart;

            console.log(`[DB] Test query successful in ${queryTime}ms`);

            return {
                success: true,
                message: `Database connection successful. Connect: ${connectTime}ms, Ping: ${pingTime}ms, Query: ${queryTime}ms`,
                details: { connectTime, pingTime, queryTime },
            };
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error("[DB] Connection test failed:", error);

        let message = "Database connection failed";
        const details: any = {
            error: error.message,
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
        };

        if (error.code === "ETIMEDOUT") {
            message = "Connection timeout - server might be unreachable or firewall blocking";
        } else if (error.code === "ECONNREFUSED") {
            message = "Connection refused - server might be down or port closed";
        } else if (error.code === "ENOTFOUND") {
            message = "Host not found - check hostname/IP address";
        } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
            message = "Access denied - check username/password";
        }

        return { success: false, message, details };
    }
}
