import { getDatabase } from "../core/configs/db";
import { logger } from "../core/utils/logging";
import { ErrorResponse } from "../data/responses/error_response";

export class HealthRepo {
    static async checkDbConnection(): Promise<boolean | ErrorResponse> {
        const db = getDatabase();
        try {
            await db.execute("SELECT 1"); // simple ping query
            return true;
        } catch (err) {
            logger.error("Database connection error:", err);
            return false;
        }
    }
}
