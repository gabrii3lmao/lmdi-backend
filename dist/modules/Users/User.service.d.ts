import type { LoginUserType, RegisterUserType } from "./dto/userTypes.js";
import { UserRepository } from "./User.repository.js";
export declare class UserService {
    private readonly _userRepository;
    constructor(_userRepository: UserRepository);
    register(userData: RegisterUserType): Promise<{
        message: string;
    }>;
    login(userData: LoginUserType): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
            isVerified: boolean;
        };
    }>;
    sendVerificationEmail(email: string): Promise<void>;
    verifyEmail(token: string): Promise<void>;
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
            isVerified: boolean;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
        name: string;
        email: string;
    }>;
    deleteUser(userId: string): Promise<void>;
}
//# sourceMappingURL=User.service.d.ts.map