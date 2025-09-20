import swagger from "@elysiajs/swagger";

export const swaggerMiddleware = () => {
    const PORT = Bun.env.PORT ?? "8001";
    const HOST = Bun.env.HOST ?? "localhost";

    return swagger({
        path: "/docs",
        documentation: {
            info: {
                title: "Protonema - Toko Online (SOSPET PRO) API",
                version: "1.0.0",
                description: "API documentation for Protonema - Toko Online (SOSPET PRO)",
            },
            servers: [{ url: Bun.env.MODE === "development" ? `http://${HOST}:${PORT}` : `https://${HOST}` }],
        },
        // hindari swagger “mengklaim” /login & /logout
        exclude: ["/login", "/logout"],
    });
};
