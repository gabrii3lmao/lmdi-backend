import express from "express";
import { UserController } from "./User.controller.js";
import { UserService } from "./User.service.js";
import { UserRepository } from "./User.repository.js";
import { EmailService } from "./Email.service.js"; // Criaremos isso
import authMiddleware from "../../middlewares/authMiddleware.js";
const authRouter = express.Router();

const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const userController = new UserController(userService, userRepository);

authRouter.post("/signup", userController.register);
authRouter.post("/signin", userController.login);
authRouter.post("/signout", authMiddleware, userController.logout);
authRouter.post("/refresh-token", userController.refreshToken);
authRouter.post("/google", userController.googleLogin);

authRouter.post("/forgot-password", userController.forgotPassword);
authRouter.post("/reset-password/:token", userController.resetPassword);

export default authRouter;
