import type { Request, Response, NextFunction } from "express";
import type { UserService } from "./User.service.js";
import { userValidationSchema, loginValidationSchema } from "./dto/User.dto.js";
import { verifyRefreshToken } from "../../config/jwtService.js";
import { UserRepository } from "./User.repository.js";
import generateToken from "../../config/jwtService.js";

export class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _userRepository: UserRepository,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = userValidationSchema.parse(req.body);
      const user = await this._userService.register(validatedData);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginValidationSchema.parse(req.body);
      const { accessToken, refreshToken, user } =
        await this._userService.login(validatedData);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.json({
        message: "Login bem-sucedido!",
        token: accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.json({ message: "Logout realizado com sucesso" });
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      await this._userService.forgotPassword(email);

      return res.status(200).json({ message: "Email de recuperação enviado!" });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      await this._userService.resetPassword(token as string, password);

      return res.status(200).json({ message: "Senha atualizada com sucesso!" });
    } catch (error) {
      next(error);
    }
  };

  googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { credential } = req.body;

      const { accessToken, refreshToken, user } =
        await this._userService.googleLogin(credential);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.json({
        message: "Login com Google bem-sucedido!",
        token: accessToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    const incomingToken = req.cookies.refreshToken;

    if (!incomingToken) {
      return res.status(401).json({ message: "Refresh token não fornecido" });
    }

    try {
      const { accessToken, refreshToken } =
        await this._userService.refreshAccessToken(incomingToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.json({ accessToken });
    } catch (error) {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return res
        .status(401)
        .json({ message: "Refresh token inválido ou expirado" });
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const user = await this._userService.getProfile(userId);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  };

  deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      await this._userService.deleteUser(userId);
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      return res.json({ message: "Conta deletada com sucesso" });
    } catch (error) {
      next(error);
    }
  };
}
