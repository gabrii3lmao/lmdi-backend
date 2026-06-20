import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserController } from "../../modules/Users/User.controller.js";
import { HttpException } from "../../config/errorHandler.js";
describe("UserController", () => {
    let mockService;
    let mockRepo;
    let controller;
    let req;
    let res;
    let next;
    beforeEach(() => {
        mockService = {
            register: vi.fn(),
            login: vi.fn(),
            forgotPassword: vi.fn(),
            resetPassword: vi.fn(),
            googleLogin: vi.fn(),
            refreshAccessToken: vi.fn(),
            verifyEmail: vi.fn(),
            sendVerificationEmail: vi.fn(),
        };
        mockRepo = {};
        controller = new UserController(mockService, mockRepo);
        req = {
            body: {},
            params: {},
            cookies: {},
            user: { id: "user-1" },
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
            cookie: vi.fn(),
            clearCookie: vi.fn(),
        };
        next = vi.fn();
    });
    describe("register", () => {
        it("deve registrar usuário e retornar 201 com mensagem de verificação", async () => {
            req.body = { name: "Prof", email: "prof@test.com", password: "123456" };
            vi.mocked(mockService.register).mockResolvedValue({
                message: "Conta criada! Verifique seu email antes de fazer login.",
            });
            await controller.register(req, res, next);
            expect(mockService.register).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Conta criada! Verifique seu email antes de fazer login.",
            });
        });
        it("deve chamar next com erro se registro falhar", async () => {
            req.body = { name: "Prof", email: "prof@test.com", password: "123456" };
            const error = new HttpException("Email already in use", 400);
            vi.mocked(mockService.register).mockRejectedValue(error);
            await controller.register(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe("login", () => {
        it("deve logar e retornar token + setar cookie", async () => {
            req.body = { email: "prof@test.com", password: "123456" };
            const loginResult = {
                accessToken: "at-123",
                refreshToken: "rt-123",
                user: { id: "user-1", name: "Prof", email: "prof@test.com", isVerified: true },
            };
            vi.mocked(mockService.login).mockResolvedValue(loginResult);
            await controller.login(req, res, next);
            expect(res.cookie).toHaveBeenCalledWith("refreshToken", "rt-123", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            expect(res.json).toHaveBeenCalledWith({
                message: "Login bem-sucedido!",
                token: "at-123",
                user: loginResult.user,
            });
        });
        it("deve chamar next com erro se credenciais forem inválidas", async () => {
            req.body = { email: "prof@test.com", password: "wrongpassword" };
            vi.mocked(mockService.login).mockRejectedValue(new HttpException("Invalid credentials", 401));
            await controller.login(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(HttpException));
        });
    });
    describe("logout", () => {
        it("deve limpar cookie e retornar mensagem", async () => {
            await controller.logout(req, res, next);
            expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
            expect(res.json).toHaveBeenCalledWith({
                message: "Logout realizado com sucesso",
            });
        });
    });
    describe("verifyEmail", () => {
        it("deve verificar email e retornar 200", async () => {
            req.params = { token: "valid-token" };
            vi.mocked(mockService.verifyEmail).mockResolvedValue(undefined);
            await controller.verifyEmail(req, res, next);
            expect(mockService.verifyEmail).toHaveBeenCalledWith("valid-token");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Email verificado com sucesso!",
            });
        });
        it("deve chamar next com erro se token for inválido", async () => {
            req.params = { token: "invalid-token" };
            const error = new HttpException("Token inválido ou expirado", 400);
            vi.mocked(mockService.verifyEmail).mockRejectedValue(error);
            await controller.verifyEmail(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
    describe("resendVerification", () => {
        it("deve reenviar email de verificação e retornar 200", async () => {
            req.body = { email: "prof@test.com" };
            vi.mocked(mockService.sendVerificationEmail).mockResolvedValue(undefined);
            await controller.resendVerification(req, res, next);
            expect(mockService.sendVerificationEmail).toHaveBeenCalledWith("prof@test.com");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Email de verificação reenviado!",
            });
        });
        it("deve retornar 400 se email não for fornecido", async () => {
            req.body = {};
            await controller.resendVerification(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Email é obrigatório" });
        });
    });
    describe("forgotPassword", () => {
        it("deve enviar email e retornar 200", async () => {
            req.body = { email: "prof@test.com" };
            vi.mocked(mockService.forgotPassword).mockResolvedValue(undefined);
            await controller.forgotPassword(req, res, next);
            expect(mockService.forgotPassword).toHaveBeenCalledWith("prof@test.com");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Email de recuperação enviado!",
            });
        });
    });
    describe("resetPassword", () => {
        it("deve resetar senha e retornar 200", async () => {
            req.params = { token: "valid-token" };
            req.body = { password: "nova-senha" };
            vi.mocked(mockService.resetPassword).mockResolvedValue({ _id: "user-1" });
            await controller.resetPassword(req, res, next);
            expect(mockService.resetPassword).toHaveBeenCalledWith("valid-token", "nova-senha");
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
    describe("googleLogin", () => {
        it("deve logar com Google e retornar tokens com isVerified", async () => {
            req.body = { credential: "google-token" };
            vi.mocked(mockService.googleLogin).mockResolvedValue({
                accessToken: "at-123",
                refreshToken: "rt-123",
                user: { id: "user-1", name: "Prof", email: "prof@test.com", isVerified: true },
            });
            await controller.googleLogin(req, res, next);
            expect(res.cookie).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: "Login com Google bem-sucedido!",
                token: "at-123",
                user: expect.any(Object),
            });
        });
    });
    describe("refreshToken", () => {
        it("deve renovar token com refreshToken válido", async () => {
            req.cookies = { refreshToken: "rt-123" };
            vi.mocked(mockService.refreshAccessToken).mockResolvedValue({
                accessToken: "new-at",
                refreshToken: "new-rt",
            });
            await controller.refreshToken(req, res, next);
            expect(mockService.refreshAccessToken).toHaveBeenCalledWith("rt-123");
            expect(res.cookie).toHaveBeenCalledWith("refreshToken", "new-rt", expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({ accessToken: "new-at" });
        });
        it("deve retornar 401 se não houver refreshToken no cookie", async () => {
            req.cookies = {};
            await controller.refreshToken(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Refresh token não fornecido",
            });
        });
        it("deve limpar cookie e retornar 401 se refresh token for inválido", async () => {
            req.cookies = { refreshToken: "bad-token" };
            vi.mocked(mockService.refreshAccessToken).mockRejectedValue(new Error("Invalid token"));
            await controller.refreshToken(req, res, next);
            expect(res.clearCookie).toHaveBeenCalledWith("refreshToken", expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Refresh token inválido ou expirado",
            });
        });
    });
});
//# sourceMappingURL=User.controller.spec.js.map