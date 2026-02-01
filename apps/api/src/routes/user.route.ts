import { Router } from "express";
import { getUsers, createUser } from "../controllers/user.controller";
import { validateUserCreation } from "../middleware/validation.middleware";

export const userRoutes = Router();

userRoutes.route("/").get(getUsers).post(validateUserCreation, createUser);