import { Request, Response } from "express";
import { getAllUsers, createUser as createUserService } from "../services/user.service";

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Public
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
    });
  }
};

// @desc    Create a user
// @route   POST /api/v1/users
// @access  Public
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: "Email, name, and password are required",
      });
    }

    const user = await createUserService({ email, name, password });

    // Don't return the password in the response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: "Bad Request",
      details: error.message,
    });
  }
};