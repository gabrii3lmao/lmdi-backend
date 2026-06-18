import User, { type IUser } from "./userModel.js";
import type { RegisterUserType } from "./dto/userTypes.js";

export class UserRepository {
  async create(userData: RegisterUserType): Promise<IUser> {
    return await User.create(userData);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({
      email,
    });
  }

  async setPasswordResetToken(email: string, token: string, expires: number) {
    return await User.findOneAndUpdate(
      { email },
      { resetPasswordToken: token, resetPasswordExpires: expires },
      { new: true },
    );
  }

  async resetPasswordByToken(token: string, newPassword: string) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return null;

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return user;
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async updateRefreshToken(userId: string, token: string | null) {
    return await User.findByIdAndUpdate(
      userId,
      { refreshToken: token },
      { returnDocument: "after" },
    );
  }

  async deleteById(id: string) {
    const deletedUser = await User.findByIdAndDelete(id);
    return deletedUser;
  }
}
