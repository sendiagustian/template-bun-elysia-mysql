export interface AuthModel {
    uid: string;
    user_uid: string;
    token: string;
    status: "login" | "logout";
    expired_at: number | null;
    created_at: string;
    updated_at: string;
}
