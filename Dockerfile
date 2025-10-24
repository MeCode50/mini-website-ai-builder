FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]