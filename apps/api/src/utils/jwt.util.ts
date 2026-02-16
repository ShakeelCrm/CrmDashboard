import jwt from "jsonwebtoken";
import { config } from "../config/env.config";
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

export interface TokenPayload {
  id: number | string;
  email: string;
  type?: "access" | "refresh";
}

export const hasdedPassword = (password: string): string => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

export const comparePassword = (password: string, hashedPassword: string): boolean => {
  return compareSync(password, hashedPassword);
};

// Generate access token
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwtSecret as jwt.Secret,
    {
      expiresIn: config.jwtAccessExpiration || "1d" // 15 minutes for access token
    } as jwt.SignOptions
  );
};

// Generate refresh token
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    config.jwtRefreshSecret || config.jwtSecret as jwt.Secret,
    {
      expiresIn: config.jwtRefreshExpiration || "7d" // 7 days for refresh token
    } as jwt.SignOptions
  );
};

// Verify JWT token
export const verifyToken = (token: string, tokenType: "access" | "refresh" = "access"): TokenPayload | null => {
  try {
    const secret = tokenType === "refresh"
      ? config.jwtRefreshSecret || config.jwtSecret
      : config.jwtSecret;

    const decoded = jwt.verify(token, secret as jwt.Secret) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};