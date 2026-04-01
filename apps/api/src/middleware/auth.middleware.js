import { verifyToken } from "../utils/jwt.util";
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Access token is required",
        });
    }
    const decoded = verifyToken(token, "access");
    if (!decoded) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
    // Check if the token is indeed an access token
    if (decoded.type !== "access") {
        return res.status(403).json({
            success: false,
            message: "Invalid token type. Access token required.",
        });
    }
    req.user = decoded;
    next();
};
