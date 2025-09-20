export interface UserRegisterRequest {
    role?: "customer" | "admin" | "editor"; // Default role handled by service
    status?: "active" | "inActive" | "disable"; // Default status handled by service
    username: string;
    email: string;
    email_verification?: boolean;
    phone: string | null;
    phone_verification?: boolean;
    password: string;
    created_at?: Date;
    updated_at?: Date;
}
