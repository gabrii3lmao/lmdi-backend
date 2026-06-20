import { userValidationSchema, loginValidationSchema } from "./dto/User.dto.js";
import { verifyRefreshToken } from "../../config/jwtService.js";
import { UserRepository } from "./User.repository.js";
import generateToken from "../../config/jwtService.js";
export class UserController {
    _userService;
    _userRepository;
    constructor(_userService, _userRepository) {
        this._userService = _userService;
        this._userRepository = _userRepository;
    }
    register = async (req, res, next) => {
        try {
            const validatedData = userValidationSchema.parse(req.body);
            const user = await this._userService.register(validatedData);
            return res.status(201).json(user);
        }
        catch (error) {
            next(error);
        }
    };
    login = async (req, res, next) => {
        try {
            const validatedData = loginValidationSchema.parse(req.body);
            const { accessToken, refreshToken, user } = await this._userService.login(validatedData);
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
        }
        catch (error) {
            next(error);
        }
    };
    logout = async (_req, res, next) => {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.json({ message: "Logout realizado com sucesso" });
    };
    verifyEmail = async (req, res, next) => {
        try {
            const { token } = req.params;
            await this._userService.verifyEmail(token);
            return res.status(200).json({ message: "Email verificado com sucesso!" });
        }
        catch (error) {
            next(error);
        }
    };
    resendVerification = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email é obrigatório" });
            }
            await this._userService.sendVerificationEmail(email);
            return res.status(200).json({ message: "Email de verificação reenviado!" });
        }
        catch (error) {
            next(error);
        }
    };
    forgotPassword = async (req, res, next) => {
        try {
            const { email } = req.body;
            await this._userService.forgotPassword(email);
            return res.status(200).json({ message: "Email de recuperação enviado!" });
        }
        catch (error) {
            next(error);
        }
    };
    resetPassword = async (req, res, next) => {
        try {
            const { token } = req.params;
            const { password } = req.body;
            await this._userService.resetPassword(token, password);
            return res.status(200).json({ message: "Senha atualizada com sucesso!" });
        }
        catch (error) {
            next(error);
        }
    };
    googleLogin = async (req, res, next) => {
        try {
            const { credential } = req.body;
            const { accessToken, refreshToken, user } = await this._userService.googleLogin(credential);
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
        }
        catch (error) {
            next(error);
        }
    };
    refreshToken = async (req, res, next) => {
        const incomingToken = req.cookies.refreshToken;
        if (!incomingToken) {
            return res.status(401).json({ message: "Refresh token não fornecido" });
        }
        try {
            const { accessToken, refreshToken } = await this._userService.refreshAccessToken(incomingToken);
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            });
            return res.json({ accessToken });
        }
        catch (error) {
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
    getProfile = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const user = await this._userService.getProfile(userId);
            return res.json(user);
        }
        catch (error) {
            next(error);
        }
    };
    deleteAccount = async (req, res, next) => {
        try {
            const userId = req.user.id;
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
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=User.controller.js.map