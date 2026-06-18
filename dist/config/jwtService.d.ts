import jwt from "jsonwebtoken";
export default function generateToken(payload: object): {
    accessToken: string;
    refreshToken: string;
};
export declare function verifyRefreshToken(token: string): string | jwt.JwtPayload;
export declare function verifyAccessToken(token: string): string | jwt.JwtPayload;
//# sourceMappingURL=jwtService.d.ts.map