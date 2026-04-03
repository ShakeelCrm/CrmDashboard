# Use stable Node
FROM node:20

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy everything
COPY . .

# Install dependencies
RUN pnpm install

# Generate Prisma
WORKDIR /app/apps/api
RUN npx prisma generate

# Build API
RUN pnpm build

# Expose port
EXPOSE 3000

# Start API
CMD ["pnpm", "--filter", "api", "start"]