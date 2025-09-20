export interface UserLoginResponse {
    uid: string;
    username: string;
    email: string;
    role: string;
    token: string | null;
}
