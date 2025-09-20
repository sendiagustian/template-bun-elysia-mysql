import { Context } from "elysia";
import { UserModel } from "../../data/models/user_model";
import { ErrorResponse } from "../../data/responses/error_response";
import { UserRepo } from "../../repos/user_repo";
import { getUsernameFromToken } from "./jwt";

export const getUserModelByHeader = async (context: Context): Promise<UserModel | ErrorResponse> => {
    const username = getUsernameFromToken(context.headers["authorization"]!);
    const user = await UserRepo.findUserByUsername(username);

    if (!user) {
        context.set.status = 404;
        return {
            success: false,
            error: {
                code: "NOT_FOUND",
                message: "User not found.",
            },
        };
    }
    return user;
};
