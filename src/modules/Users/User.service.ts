import generateToken from "../../config/jwtService.js";
import type { LoginUserType, RegisterUserType } from "./dto/userTypes.js";
import { UserRepository } from "./User.repository.js";
import crypto from "crypto";
import { EmailService } from "./Email.service.js";
import { emaillQueue } from "./Email.queue.js";

export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _emailService: EmailService,
  ) {}

  async register(userData: RegisterUserType) {
    const existingUser = await this._userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error("Email already in use");
    }

    return await this._userRepository.create(userData);
  }

  async login(userData: LoginUserType) {
    const user = await this._userRepository.findByEmail(userData.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.isValidPassword(userData.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async forgotPassword(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email not found");
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = Date.now() + 3600000; // 1 hora

    await this._userRepository.setPasswordResetToken(email, token, expires);

    await emaillQueue.add(
      "sendPasswordResetEmail",
      {
        to: user.email,
        token,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 60000,
        },
      },
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this._userRepository.resetPasswordByToken(
      token,
      newPassword,
    );

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    return user;
  }
}
