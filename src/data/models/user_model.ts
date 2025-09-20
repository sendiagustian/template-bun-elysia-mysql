export interface UserModel {
    user_uid: string;
    role: "customer" | "admin" | "editor";
    status: "active" | "inActive" | "disable";
    username: string;
    email: string;
    email_verification: boolean;
    phone: string;
    phone_verification: boolean;
    password: string;
    created_at: string;
    updated_at: string;
}
