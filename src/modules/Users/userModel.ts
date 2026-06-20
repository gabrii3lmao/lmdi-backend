import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string | Promise<string>;
  refreshToken?: string;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined | number;
  role: string | string[];
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  isValidPassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: { type: String, enum: ["admin", "teacher"], default: "teacher" },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  try {
    // vê se a senha foi modificada
    if (!this.isModified("password") || !this.password) return;

    // gera um salt e faz um hash sobre a senha
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
  } catch (error: any) {
    throw error;
  }
});

userSchema.methods.isValidPassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
