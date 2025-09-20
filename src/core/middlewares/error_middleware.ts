import { ErrorResponse } from "../../data/responses/error_response";
import { ElysiaErrorCodeSchema, ElysiaSetSchema } from "../schema/elysia_context";

export const errorMiddleware = (code: ElysiaErrorCodeSchema, set: ElysiaSetSchema): ErrorResponse => {
    let statusCode = 500;
    let message = "Terjadi kesalahan pada server";

    switch (code) {
        case "VALIDATION":
            statusCode = 400;
            message = "Validasi gagal";
            break;
        case "NOT_FOUND":
            statusCode = 404;
            message = "Path Endpoint tidak ditemukan";
            break;
        case "PARSE":
            statusCode = 400;
            message = "Permintaan tidak dapat diuraikan";
            break;
        case "INVALID_COOKIE_SIGNATURE":
            statusCode = 401;
            message = "Tanda tangan cookie tidak valid";
            break;
        case "INVALID_FILE_TYPE":
            statusCode = 415;
            message = "Tipe file tidak didukung";
            break;
        case "INTERNAL_SERVER_ERROR":
            statusCode = 500;
            message = "Kesalahan server internal";
            break;
        case "UNKNOWN":
        default:
            statusCode = typeof code === "number" ? code : 500;
            message = "Terjadi kesalahan yang tidak diketahui";
            break;
    }

    // Set HTTP status code
    set.status = statusCode;

    return {
        success: false,
        error: {
            code: code,
            message: message,
        },
    };
};
