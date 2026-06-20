import generateToken, { verifyRefreshToken } from "../../config/jwtService.js";
import type { LoginUserType, RegisterUserType } from "./dto/userTypes.js";
import { UserRepository } from "./User.repository.js";
import crypto from "crypto";
import { emaillQueue } from "./Email.queue.js";
import { HttpException } from "../../config/errorHandler.js";
import { OAuth2Client } from "google-auth-library";
import { DeleteUserDataService } from "./DeleteUserDataService.js";


const deleteUserDataService = new DeleteUserDataService(
  new UserRepository(),
  new (await import("../Classes/Class.repository.js")).ClassRepository(),
  new (await import("../Submission/Submission.repository.js")).SubmissionRepository(),
  new (await import("../Exams/Exam.repository.js")).ExamRepository(),
);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class UserService {
  constructor(
    private readonly _userRepository: UserRepository,
  ) {}

  async register(userData: RegisterUserType) {
    const existingUser = await this._userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new HttpException("Email already in use", 400);
    }

    const user = await this._userRepository.create(userData);

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await this._userRepository.setVerificationToken(user.email, token, expires);

    await emaillQueue.add(
      "sendVerificationEmail",
      { to: user.email, token },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
      },
    );

    return {
      message: "Conta criada! Verifique seu email antes de fazer login.",
    };
  }

  async login(userData: LoginUserType) {
    const user = await this._userRepository.findByEmail(userData.email);

    if (!user) {
      throw new HttpException("Invalid credentials", 401);
    }

    const isPasswordValid = await user.isValidPassword(userData.password);

    if (!isPasswordValid) {
      throw new HttpException("Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = generateToken({
      id: user._id,
      email: user.email,
    });

    user.refreshToken = refreshToken;

    await this._userRepository.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }

  async sendVerificationEmail(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new HttpException("Email not found", 404);
    }

    if (user.isVerified) {
      throw new HttpException("Email já verificado", 400);
    }

    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await this._userRepository.setVerificationToken(email, token, expires);

    await emaillQueue.add(
      "sendVerificationEmail",
      { to: user.email, token },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
      },
    );
  }

  async verifyEmail(token: string) {
    const user = await this._userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new HttpException("Token inválido ou expirado", 400);
    }

    await this._userRepository.markAsVerified(user._id.toString());
  }

  async forgotPassword(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new HttpException("Email not found", 404);
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
      throw new HttpException("Invalid or expired token", 400);
    }

    return user;
  }

  async refreshAccessToken(incomingToken: string) {
    const decoded = verifyRefreshToken(incomingToken) as {
      id: string;
      email: string;
    };
    const user = await this._userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== incomingToken) {
      throw new HttpException("Invalid refresh token", 401);
    }

    const { accessToken, refreshToken } = generateToken({
      id: user._id,
      email: user.email,
    });

    await this._userRepository.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    return { accessToken, refreshToken };
  }

  async googleLogin(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new HttpException("Token do Google inválido", 401);
    }

    const { email, name, sub: googleId } = payload;

    let user = await this._userRepository.findByEmail(email);

    if (!user) {
      const firstName = name ? name.split(" ")[0] : "Professor";
      user = await this._userRepository.create({
        email,
        name: firstName,
        password: crypto.randomBytes(20).toString("hex"),
        isVerified: true,
      } as any);
    }

    const { accessToken, refreshToken } = generateToken({
      id: user._id,
      email: user.email,
    });

    await this._userRepository.updateRefreshToken(
      user._id.toString(),
      refreshToken,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: true,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new HttpException("User not found", 404);
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async deleteUser(userId: string) {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new HttpException("User not found", 404);
    }

    await deleteUserDataService.execute(userId);
  }
}
