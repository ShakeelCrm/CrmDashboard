import jwt from "jsonwebtoken";
import { config } from "../config/env.config";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
export const hasdedPassword = (password) => {
    const salt = genSaltSync(10);
    return hashSync(password, salt);
};
export const comparePassword = (password, hashedPassword) => {
    return compareSync(password, hashedPassword);
};
// Generate access token
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtAccessExpiration || "1d" // 15 minutes for access token
    });
};
// Generate refresh token
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwtRefreshSecret || config.jwtSecret, {
        expiresIn: config.jwtRefreshExpiration || "7d" // 7 days for refresh token
    });
};
// Verify JWT token
export const verifyToken = (token, tokenType = "access") => {
    try {
        const secret = tokenType === "refresh"
            ? config.jwtRefreshSecret || config.jwtSecret
            : config.jwtSecret;
        const decoded = jwt.verify(token, secret);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
