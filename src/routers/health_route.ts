import Elysia from "elysia";
import { HealthService } from "../services/health_service";

export const healthRouter = (router: Elysia): Elysia => {
    router.get("/", async (context) => HealthService.healthCheckService(context), {
        detail: {
            tags: ["System"],
            summary: "Health check",
            description: "Check database connectivity status using a simple SELECT query.",
        },
    });

    return router;
};
