import { ElysiaAuthSchema, ElysiaJWTSchema } from "../schema/elysia_context";
import { jwtDecode } from "jwt-decode";

interface PayloadGenerateToken {
    user: string;
    set_expires: boolean;
}

interface PayloadGenerateResponse {
    token: string;
    expired_at: number | null;
}

export const jwtGenerateToken = async (
    jwt: ElysiaJWTSchema,
    auth: ElysiaAuthSchema,
    payload: PayloadGenerateToken
): Promise<PayloadGenerateResponse | null> => {
    const now = Date.now();
    const tokenExpires = payload.set_expires
        ? new Date(now + 24 * 60 * 60 * 1000) // 24 hours
        : null;

    const expires = tokenExpires ? Math.floor(tokenExpires.getTime() / 1000) : undefined;

    const tokenJWT = await jwt.sign(expires ? { username: payload.user, expires } : { name: payload.user });

    auth.set({
        value: tokenJWT,
        httpOnly: true,
        ...(tokenExpires && { expires: tokenExpires }),
    });

    return {
        token: tokenJWT,
        expired_at: expires ? expires : null,
    };
};

export const getUsernameFromToken = (token: string): string => {
    if (!token) throw new Error("Token is required");

    try {
        const decoded: any = jwtDecode(token);
        return decoded.username || decoded.name;
    } catch (error) {
        throw new Error("Invalid token");
    }
};
