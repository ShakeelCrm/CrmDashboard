import express from "express";
import cors from "cors";

import { prisma } from "./database/db";
import { userRoutes } from "./routes/user.route";
import { authRoutes } from "./routes/auth.route";
import { employeeAuthRoutes } from "./routes/employee.route";
import { errorHandler } from "./middleware/error.middleware";
import { cleanupExpiredTokens } from "./services/employee.service";

export const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend production URL
    : ['http://localhost:3000'], // Allow common dev ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

// Initialize token cleanup job (runs every 24 hours)
const cleanupInterval = setInterval(async () => {
  try {
    await cleanupExpiredTokens();
  } catch (error) {
    console.error("Error in token cleanup job:", error);
  }
}, 24 * 60 * 60 * 1000); // 24 hours

// Clean up interval on app shutdown
process.on("SIGTERM", () => {
  clearInterval(cleanupInterval);
  console.log("Token cleanup job stopped");
});

process.on("SIGINT", () => {
  clearInterval(cleanupInterval);
  console.log("Token cleanup job stopped");
});

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/employees", employeeAuthRoutes);

// Health check route
app.get("/health", (req, res) => {
  console.log("runing")
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Database health check route
app.get("/health/db", async (req, res) => {
  try {
    // Try to fetch one employee to verify DB connection
    await prisma.employee.findFirst({ take: 1 });
    res.status(200).json({ 
      status: "OK", 
      database: "connected",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({ 
      status: "ERROR", 
      database: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString() 
    });
  }
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);