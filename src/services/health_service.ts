import { Context } from "elysia";
import { WebResponse } from "../data/responses/web_response";
import { HealthRepo } from "../repos/health_repo";
import { ErrorResponse } from "../data/responses/error_response";
import { testDatabaseConnection } from "../core/configs/db";

export class HealthService {
    static async healthCheckService(context: Context): Promise<WebResponse<any> | ErrorResponse> {
        try {
            // Test koneksi database dengan detail
            const testResult = await testDatabaseConnection();

            if (!testResult.success) {
                context.set.status = 500;
                return {
                    success: false,
                    error: {
                        code: "DB_ERROR",
                        message: testResult.message,
                        details: JSON.stringify(testResult.details),
                    },
                };
            }

            // Jika koneksi berhasil, lakukan check biasa juga
            const dbOk = await HealthRepo.checkDbConnection();

            return {
                success: true,
                data: {
                    message: "Database connection successful",
                    connectionTest: testResult.message,
                    dbCheck: dbOk ? "OK" : "Failed",
                    details: testResult.details,
                },
            };
        } catch (error: any) {
            context.set.status = 500;
            return {
                success: false,
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Health check failed",
                    details: error.message,
                },
            };
        }
    }
}
