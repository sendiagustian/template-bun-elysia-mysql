import { Context } from "elysia";
import { ErrorResponse } from "../data/responses/error_response";
import { WebResponse } from "../data/responses/web_response";
import { logger } from "../core/utils/logging";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

export class UploadService {
    static async uploadImage(
        context: Context
    ): Promise<WebResponse<{ filename: string; path: string; url: string }> | ErrorResponse> {
        try {
            const body = context.body;
            const pathGroup = context.query.pathGroup || "general";
            const customName = context.query.customName || crypto.randomUUID();

            // Check if body is an object and has file properties
            if (!body || typeof body !== "object") {
                context.set.status = 400;
                return {
                    success: false,
                    error: {
                        code: "INVALID_REQUEST",
                        message: "No file provided.",
                    },
                };
            }

            // Get the first file from the body object
            const fileKeys = Object.keys(body);
            if (fileKeys.length === 0) {
                context.set.status = 400;
                return {
                    success: false,
                    error: {
                        code: "INVALID_REQUEST",
                        message: "No file provided.",
                    },
                };
            }

            const file = (body as any)[fileKeys[0]];

            // Check if it's actually a File object
            if (!(file instanceof File)) {
                context.set.status = 400;
                return {
                    success: false,
                    error: {
                        code: "INVALID_REQUEST",
                        message: "Invalid file format.",
                    },
                };
            }

            // Validate file type
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
            if (!allowedTypes.includes(file.type)) {
                context.set.status = 400;
                return {
                    success: false,
                    error: {
                        code: "VALIDATION",
                        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
                    },
                };
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                context.set.status = 400;
                return {
                    success: false,
                    error: {
                        code: "VALIDATION",
                        message: "File size too large. Maximum size is 5MB.",
                    },
                };
            }

            // Create uploads directory structure
            const uploadsDir = join(process.cwd(), "uploads");
            const pathGroupDir = join(uploadsDir, pathGroup);

            if (!existsSync(uploadsDir)) {
                mkdirSync(uploadsDir, { recursive: true });
            }

            if (!existsSync(pathGroupDir)) {
                mkdirSync(pathGroupDir, { recursive: true });
            }

            // Generate unique filename
            const fileExtension = file.name.split(".").pop() || "jpg";
            const filename = `${customName}.${fileExtension}`;
            const filePath = join(pathGroupDir, filename);

            // Save file
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            writeFileSync(filePath, buffer);

            // Generate URL
            const PORT = Bun.env.PORT;
            const HOST = Bun.env.HOST || "localhost";
            const baseUrl = Bun.env.MODE === "development" ? `http://${HOST}:${PORT}` : `https://${HOST}`;
            const fileUrl = `${baseUrl}/uploads/${pathGroup}/${filename}`;

            logger.info(`File uploaded: ${filename} to ${pathGroup}`);

            return {
                success: true,
                data: {
                    filename: filename,
                    path: `uploads/${pathGroup}/${filename}`,
                    url: fileUrl,
                },
            };
        } catch (error) {
            logger.error(`Error in UploadService.uploadImage: ${error}`);
            context.set.status = 500;
            return {
                success: false,
                error: {
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to upload image.",
                },
            };
        }
    }
}
