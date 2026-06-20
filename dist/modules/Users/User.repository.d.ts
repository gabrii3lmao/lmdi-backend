import { type IUser } from "./userModel.js";
import type { RegisterUserType } from "./dto/userTypes.js";
export declare class UserRepository {
    create(userData: RegisterUserType): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    setPasswordResetToken(email: string, token: string, expires: number): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    resetPasswordByToken(token: string, newPassword: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findById(id: string): Promise<IUser | null>;
    updateRefreshToken(userId: string, token: string | null): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    deleteById(id: string): Promise<(import("mongoose").Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    findByEmailVerificationToken(token: string): Promise<IUser | null>;
    markAsVerified(userId: string): Promise<void>;
    setVerificationToken(email: string, token: string, expires: Date): Promise<IUser | null>;
}
//# sourceMappingURL=User.repository.d.ts.map