import { JWTPayloadSpec } from "@elysiajs/jwt";
import {
    InternalServerError,
    InvalidCookieSignature,
    NotFoundError,
    ParseError,
    StatusMap,
    ValidationError,
} from "elysia";
import { Cookie, ElysiaCookie } from "elysia/cookies";
import { ElysiaCustomStatusResponse, InvalidFileType } from "elysia/error";
import { HTTPHeaders } from "elysia/types";

export type ElysiaAuthSchema = Cookie<string | undefined>;

export type ElysiaSetSchema = {
    headers: HTTPHeaders;
    status?: number | keyof StatusMap;
    redirect?: string;
    cookie?: Record<string, ElysiaCookie>;
};

export type ElysiaJWTSchema = {
    sign(morePayload: Record<string, string | number> & JWTPayloadSpec): Promise<string>;
    verify(jwt?: string): Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
};

export type ElysiaErrorCodeSchema =
    | number
    | "DB_ERROR"
    | "UNAUTHORIZED"
    | "INVALID_TOKEN"
    | "UNKNOWN"
    | "VALIDATION"
    | "NOT_FOUND"
    | "PARSE"
    | "INTERNAL_SERVER_ERROR"
    | "INVALID_COOKIE_SIGNATURE"
    | "INVALID_CREDENTIALS"
    | "INVALID_FILE_TYPE"
    | "INVALID_REQUEST"
    | "USER_CREATION_FAILED";

export type ElysiaErrorSchema =
    | Readonly<Error>
    | Readonly<ValidationError>
    | Readonly<NotFoundError>
    | Readonly<ParseError>
    | Readonly<InternalServerError>
    | Readonly<InvalidCookieSignature>
    | Readonly<InvalidFileType>
    | Readonly<ElysiaCustomStatusResponse<number, number, number>>;
