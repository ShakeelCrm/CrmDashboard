export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "fallback_jwt_secret_for_dev",
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || "15m", // 15 minutes
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d", // 7 days
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "fallback_refresh_secret_for_dev",
  emailFrom: process.env.EMAIL_FROM || '"noreply" <noreply@example.com>',
};