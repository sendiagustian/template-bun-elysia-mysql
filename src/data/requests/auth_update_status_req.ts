export interface AuthUpdateStatusReq {
    user_uid: string;
    status: "login" | "logout";
}
