import { ElysiaErrorCodeSchema } from "../../core/schema/elysia_context";

export type ErrorResponse = {
    success: boolean;
    error: {
        code: ElysiaErrorCodeSchema;
        message: string;
        details?: string;
    }
};
