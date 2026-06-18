import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "../../modules/Users/User.service.js";
import { HttpException } from "../../config/errorHandler.js";
const { mockVerifyIdToken } = vi.hoisted(() => ({
    mockVerifyIdToken: vi.fn(),
}));
vi.mock("../../modules/Users/Email.queue.js", () => ({
    emaillQueue: { add: vi.fn() },
    connection: {},
}));
vi.mock("google-auth-library", () => ({
    OAuth2Client: class {
        verifyIdToken = mockVerifyIdToken;
    },
}));
import generateToken, { verifyRefreshToken } from "../../config/jwtService.js";
vi.mock("../../config/jwtService.js", () => ({
    default: vi.fn(),
    verifyRefreshToken: vi.fn(),
}));
describe("UserService", () => {
    let userRepoMock;
    let emailServiceMock;
    let service;
    const mockUser = {
        _id: "user-1",
        name: "Professor",
        email: "prof@test.com",
        password: "hashed-password",
        refreshToken: null,
        isValidPassword: vi.fn(),
    };
    const mockTokens = {
        accessToken: "access-token-123",
        refreshToken: "refresh-token-123",
    };
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(generateToken).mockReturnValue(mockTokens);
        userRepoMock = {
            create: vi.fn(),
            findByEmail: vi.fn(),
            setPasswordResetToken: vi.fn(),
            resetPasswordByToken: vi.fn(),
            findById: vi.fn(),
            updateRefreshToken: vi.fn(),
        };
        emailServiceMock = {};
        service = new UserService(userRepoMock, emailServiceMock);
    });
    describe("register", () => {
        const registerData = {
            name: "Novo Prof",
            email: "novo@test.com",
            password: "123456",
        };
        it("deve registrar um novo usuário com sucesso", async () => {
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(null);
            vi.mocked(userRepoMock.create).mockResolvedValue(mockUser);
            const result = await service.register(registerData);
            expect(userRepoMock.findByEmail).toHaveBeenCalledWith("novo@test.com");
            expect(userRepoMock.create).toHaveBeenCalledWith(registerData);
            expect(result).toEqual(mockUser);
        });
        it("deve lançar HttpException 400 se email já estiver em uso", async () => {
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(mockUser);
            await expect(service.register(registerData)).rejects.toThrow(HttpException);
            await expect(service.register(registerData)).rejects.toMatchObject({
                statusCode: 400,
                message: "Email already in use",
            });
            expect(userRepoMock.create).not.toHaveBeenCalled();
        });
    });
    describe("login", () => {
        const loginData = { email: "prof@test.com", password: "123456" };
        it("deve realizar login com sucesso", async () => {
            const user = {
                ...mockUser,
                isValidPassword: vi.fn().mockResolvedValue(true),
            };
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(user);
            const result = await service.login(loginData);
            expect(userRepoMock.findByEmail).toHaveBeenCalledWith("prof@test.com");
            expect(user.isValidPassword).toHaveBeenCalledWith("123456");
            expect(generateToken).toHaveBeenCalledWith({
                id: "user-1",
                email: "prof@test.com",
            });
            expect(userRepoMock.updateRefreshToken).toHaveBeenCalledWith("user-1", "refresh-token-123");
            expect(result.accessToken).toBe("access-token-123");
            expect(result.user.email).toBe("prof@test.com");
        });
        it("deve lançar HttpException 401 se usuário não existir", async () => {
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(null);
            await expect(service.login(loginData)).rejects.toMatchObject({
                statusCode: 401,
            });
        });
        it("deve lançar HttpException 401 se senha for inválida", async () => {
            const user = {
                ...mockUser,
                isValidPassword: vi.fn().mockResolvedValue(false),
            };
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(user);
            await expect(service.login(loginData)).rejects.toMatchObject({
                statusCode: 401,
            });
        });
    });
    describe("forgotPassword", () => {
        it("deve criar token de reset e enfileirar email", async () => {
            const { emaillQueue } = await import("../../modules/Users/Email.queue.js");
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(mockUser);
            vi.mocked(userRepoMock.setPasswordResetToken).mockResolvedValue(mockUser);
            await service.forgotPassword("prof@test.com");
            expect(userRepoMock.setPasswordResetToken).toHaveBeenCalledWith("prof@test.com", expect.any(String), expect.any(Number));
            expect(emaillQueue.add).toHaveBeenCalledWith("sendPasswordResetEmail", { to: "prof@test.com", token: expect.any(String) }, expect.objectContaining({ attempts: 3 }));
        });
        it("deve lançar HttpException 404 se email não existir", async () => {
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(null);
            await expect(service.forgotPassword("notfound@test.com")).rejects.toMatchObject({ statusCode: 404 });
        });
    });
    describe("resetPassword", () => {
        it("deve redefinir senha com token válido", async () => {
            vi.mocked(userRepoMock.resetPasswordByToken).mockResolvedValue(mockUser);
            const result = await service.resetPassword("valid-token", "nova-senha");
            expect(userRepoMock.resetPasswordByToken).toHaveBeenCalledWith("valid-token", "nova-senha");
            expect(result).toEqual(mockUser);
        });
        it("deve lançar HttpException 400 se token for inválido", async () => {
            vi.mocked(userRepoMock.resetPasswordByToken).mockResolvedValue(null);
            await expect(service.resetPassword("invalid-token", "nova-senha")).rejects.toMatchObject({ statusCode: 400 });
        });
    });
    describe("refreshAccessToken", () => {
        it("deve renovar os tokens com sucesso", async () => {
            vi.mocked(verifyRefreshToken).mockReturnValue({
                id: "user-1",
                email: "prof@test.com",
            });
            const user = { ...mockUser, refreshToken: "refresh-token-123" };
            vi.mocked(userRepoMock.findById).mockResolvedValue(user);
            const result = await service.refreshAccessToken("refresh-token-123");
            expect(verifyRefreshToken).toHaveBeenCalledWith("refresh-token-123");
            expect(userRepoMock.findById).toHaveBeenCalledWith("user-1");
            expect(generateToken).toHaveBeenCalled();
            expect(userRepoMock.updateRefreshToken).toHaveBeenCalledWith("user-1", "refresh-token-123");
            expect(result.accessToken).toBe("access-token-123");
        });
        it("deve lançar HttpException 401 se user não existir", async () => {
            vi.mocked(verifyRefreshToken).mockReturnValue({ id: "user-1" });
            vi.mocked(userRepoMock.findById).mockResolvedValue(null);
            await expect(service.refreshAccessToken("some-token")).rejects.toMatchObject({ statusCode: 401 });
        });
        it("deve lançar HttpException 401 se refresh token não corresponder", async () => {
            vi.mocked(verifyRefreshToken).mockReturnValue({ id: "user-1" });
            const user = { ...mockUser, refreshToken: "different-token" };
            vi.mocked(userRepoMock.findById).mockResolvedValue(user);
            await expect(service.refreshAccessToken("some-token")).rejects.toMatchObject({ statusCode: 401 });
        });
    });
    describe("googleLogin", () => {
        beforeEach(() => {
            mockVerifyIdToken.mockReset();
        });
        it("deve logar usuário existente com Google", async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    email: "prof@test.com",
                    name: "Professor Silva",
                    sub: "google-123",
                }),
            });
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(mockUser);
            const result = await service.googleLogin("google-id-token");
            expect(userRepoMock.findByEmail).toHaveBeenCalledWith("prof@test.com");
            expect(userRepoMock.create).not.toHaveBeenCalled();
            expect(result.user.email).toBe("prof@test.com");
        });
        it("deve criar novo usuário se não existir no Google login", async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => ({
                    email: "novo@google.com",
                    name: "Novo Usuário",
                    sub: "google-456",
                }),
            });
            vi.mocked(userRepoMock.findByEmail).mockResolvedValue(null);
            vi.mocked(userRepoMock.create).mockResolvedValue({
                ...mockUser,
                email: "novo@google.com",
            });
            const result = await service.googleLogin("google-id-token");
            expect(userRepoMock.create).toHaveBeenCalledWith(expect.objectContaining({
                email: "novo@google.com",
                name: "Novo",
            }));
            expect(result.user.email).toBe("novo@google.com");
        });
        it("deve lançar HttpException 401 se payload do Google for inválido", async () => {
            mockVerifyIdToken.mockResolvedValue({
                getPayload: () => null,
            });
            await expect(service.googleLogin("bad-token")).rejects.toMatchObject({ statusCode: 401 });
        });
    });
});
//# sourceMappingURL=User.service.spec.js.map