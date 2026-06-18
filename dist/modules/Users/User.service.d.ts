import type { LoginUserType, RegisterUserType } from "./dto/userTypes.js";
import { UserRepository } from "./User.repository.js";
import { EmailService } from "./Email.service.js";
export declare class UserService {
    private readonly _userRepository;
    private readonly _emailService;
    constructor(_userRepository: UserRepository, _emailService: EmailService);
    register(userData: RegisterUserType): Promise<import("./userModel.js").IUser>;
    login(userData: LoginUserType): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
    }>;
    forgotPassword(email: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<import("mongoose").Document<unknown, {}, import("./userModel.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./userModel.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    refreshAccessToken(incomingToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    googleLogin(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
    }>;
    deleteUser(userId: string): Promise<import("mongoose").Document<unknown, {}, import("./userModel.js").IUser, {}, import("mongoose").DefaultSchemaOptions> & import("./userModel.js").IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
//# sourceMappingURL=User.service.d.ts.map