import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { swaggerMiddleware } from "./core/middlewares/swagger_middleware";
import { loggerAfterMiddleware, loggerBeforeMiddleware } from "./core/middlewares/logger_middleware";
import { errorMiddleware } from "./core/middlewares/error_middleware";
import { logger } from "./core/utils/logging";
import { healthRouter } from "./routers/health_route";
import staticPlugin from "@elysiajs/static";
import { uploadRouter } from "./routers/upload_router";

const app = new Elysia()
    .use(cors())
    .use(swaggerMiddleware())
    .use(staticPlugin({ assets: "uploads", prefix: "/uploads" }))
    .get("/favicon.ico", () => new Response(null, { status: 204 }))
    .onBeforeHandle((context) => loggerBeforeMiddleware(context))
    .onAfterResponse((context) => loggerAfterMiddleware(context))
    .onError((context) => {
        // Skip logging for common browser/dev tool requests
        const ignorePaths = ["/.well-known/", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

        const shouldIgnore = ignorePaths.some((path) => context.path?.startsWith(path));

        if (!shouldIgnore) {
            logger.error(`Error occurred: ${context.error}`);
            logger.error(context);
        }

        errorMiddleware(context.code, context.set);
    })
    .group("/api/v1", (app) => {
        app.group("health-check", (group) => group.use(healthRouter));
        app.group("upload", (group) => group.use(uploadRouter));

        // SAMPLE AUTHENTICATION
        // app.group("auth", (group) => group.use(authRouter));
        // SAMPLE USER WITH JWT AUTHENTICATION
        // app.group("user", (group) => group.use(jwtAuthMiddleware).use(userRouter));

        return app;
    });

const PORT = parseInt(process.env.PORT || "8001", 10);

app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}/docs`);
});
