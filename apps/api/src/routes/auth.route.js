import { Router } from "express";
import { loginUser, registerUser, getMe } from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validateUserCreation } from "../middleware/validation.middleware";
export const authRoutes = Router();
authRoutes.post("/login", loginUser);
authRoutes.post("/register", validateUserCreation, registerUser); // Using the same validation as for user creation
authRoutes.get("/me", authenticateJWT, getMe);
