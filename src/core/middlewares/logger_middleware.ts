import { Context } from "elysia";
import { logger } from "../utils/logging";

export interface CustomStore {
    startTime: number;
}

export const loggerBeforeMiddleware = (context: Context) => {
    const customStore = context.store as { startTime: number };
    customStore.startTime = performance.now();

    //     console.log(`[INCOMING REQUEST] ${new Date().toISOString()}`);
    //     console.log(`>> Path: ${context.path}`);
    //     console.log(`>> Method: ${context.request.method}`);

    //     // Cetak semua headers
    //     const headers: { [key: string]: string } = {};
    //     for (const [key, value] of context.request.headers.entries()) {
    //         headers[key] = value;
    //     }
    //     console.log(">> Headers:", JSON.stringify(headers, null, 2));

    //     // Cetak body yang sudah diparsing oleh Elysia
    //     console.log(">> Parsed Body:", context.body);
    //     console.log("----------------------------------------------------");
};

export const loggerAfterMiddleware = (context: Context) => {
    const endpoint = context.path;
    const method = context.request.method;
    const status = context.set.status;

    const customStore = context.store as { startTime: number };
    const startTime = customStore.startTime;
    const duration = performance.now() - startTime;

    const logMessage = `[${method}] ${endpoint} => Code: ${status} - Time: ${duration.toFixed(2)}ms`;

    if (typeof status === "number" && status >= 200 && status < 300) {
        logger.info(logMessage);
    } else {
        logger.error(logMessage);
    }
};
