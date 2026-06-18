import User, {} from "./userModel.js";
export class UserRepository {
    async create(userData) {
        return await User.create(userData);
    }
    async findByEmail(email) {
        return await User.findOne({
            email,
        });
    }
    async setPasswordResetToken(email, token, expires) {
        return await User.findOneAndUpdate({ email }, { resetPasswordToken: token, resetPasswordExpires: expires }, { new: true });
    }
    async resetPasswordByToken(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user)
            return null;
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return user;
    }
    async findById(id) {
        return await User.findById(id);
    }
    async updateRefreshToken(userId, token) {
        return await User.findByIdAndUpdate(userId, { refreshToken: token }, { returnDocument: "after" });
    }
    async deleteById(id) {
        const deletedUser = await User.findByIdAndDelete(id);
        return deletedUser;
    }
}
//# sourceMappingURL=User.repository.js.map