import { Router } from "express";
import {
  loginEmployeeController,
  registerEmployeeController,
  refreshAccessTokenController,
  logoutEmployeeController,
  getEmployeeMe
} from "../controllers/employee.controller";
import { authenticateJWT } from "../middleware/auth.middleware";

export const employeeAuthRoutes = Router();

// Public routes
employeeAuthRoutes.post("/login", loginEmployeeController);
employeeAuthRoutes.post("/register", registerEmployeeController);
employeeAuthRoutes.post("/refresh-token", refreshAccessTokenController);
employeeAuthRoutes.post("/logout", logoutEmployeeController);

// Protected routes
employeeAuthRoutes.get("/me", authenticateJWT, getEmployeeMe);