# Stage 1: Build
FROM oven/bun:slim AS builder
WORKDIR /app

COPY . .

# Jalankan install + build
RUN bun install
RUN bun run build

# Stage 2: Runtime
FROM debian:bookworm-slim AS runner
WORKDIR /app

# Install minimal runtime deps (libc6)
RUN apt-get update && \
    apt-get install -y libc6 && \
    rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p uploads templates

# Copy hanya binary & env
COPY --from=builder /app/build/app.bun ./app.bun
COPY --from=builder /app/templates/ ./templates/
COPY --from=builder /app/.env.production .env

EXPOSE 3007
CMD ["./app.bun"]
