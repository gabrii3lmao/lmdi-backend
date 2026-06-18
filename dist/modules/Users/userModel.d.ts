import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string | Promise<string>;
    refreshToken?: string;
    resetPasswordToken?: string | undefined;
    resetPasswordExpires?: Date | undefined | number;
    role: string | string[];
    isValidPassword(password: string): Promise<boolean>;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=userModel.d.ts.map