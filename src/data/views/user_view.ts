export interface UserView {
    user_uid: string;
    role: "customer" | "admin" | "editor";
    status: "active" | "inActive" | "disable";
    username: string;
    email: string;
    phone: string;
    created_at: string;
    updated_at: string;
}
