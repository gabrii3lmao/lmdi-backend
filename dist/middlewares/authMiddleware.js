import { verifyAccessToken } from "../config/jwtService.js";
export default (req, res, next) => {
    const token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ message: "Acesso negado. Nenhum token fornecido" });
    }
    try {
        const decoded = verifyAccessToken(token);
        req.user = { id: decoded.id };
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado." });
    }
};
//# sourceMappingURL=authMiddleware.js.map