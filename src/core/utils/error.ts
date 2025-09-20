import { Context } from "elysia";
import { ErrorResponse } from "../../data/responses/error_response";

export class AuthenticationError extends Error {
    constructor(public message: string) {
        super(message);
    }
}
export class AuthorizationError extends Error {
    constructor(public message: string) {
        super(message);
    }
}

export class InvariantError extends Error {
    constructor(public message: string) {
        super(message);
    }
}

export const handleRepoError = (result: any, set: Context["set"]): ErrorResponse | null => {
    if (!result || (result as ErrorResponse).success) {
        set.status = result?.details?.includes("not found") ? 404 : 500;
        return {
            success: false,
            error: {
                code: result?.error?.code || "UNKNOWN_ERROR",
                message: result?.error?.message || "An unexpected error occurred.",
            },
        };
    }
    return null;
};
