import type { Request, Response, NextFunction } from "express";
import type { UserService } from "./User.service.js";
import { UserRepository } from "./User.repository.js";
export declare class UserController {
    private readonly _userService;
    private readonly _userRepository;
    constructor(_userService: UserService, _userRepository: UserRepository);
    register: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    login: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    logout: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    resendVerification: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    googleLogin: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    refreshToken: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    getProfile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteAccount: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=User.controller.d.ts.map