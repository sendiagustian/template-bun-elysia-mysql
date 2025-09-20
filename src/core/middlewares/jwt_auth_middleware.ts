import jwt from "@elysiajs/jwt";
import type { Elysia } from "elysia";
import { ErrorResponse } from "../../data/responses/error_response";

export const jwtSetup = jwt({ name: "jwt", secret: Bun.env.JWT_SECRET! });

export const jwtAuthMiddleware = (app: Elysia) =>
    app.use(jwtSetup).onBeforeHandle(async ({ jwt, headers, set }) => {
        const token = headers.authorization?.replace("Bearer ", "");

        if (!token) {
            set.status = 401;
            const response: ErrorResponse = {
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token is required",
                },
            };

            return response;
        }

        const payload = await jwt.verify(token);

        if (!payload) {
            set.status = 401;
            const response: ErrorResponse = {
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid token",
                },
            };
            return response;
        }

        const isExpired = payload.expires && Number(payload.expires) < Math.floor(Date.now() / 1000);

        if (isExpired) {
            set.status = 401;
            const response: ErrorResponse = {
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Token is expired",
                },
            };

            return response;
        }

        // Valid token, do nothing
        return;
    });
