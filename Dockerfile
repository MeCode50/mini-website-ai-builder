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

# Build the application with verbose output
RUN npm run build --verbose

# Verify build output
RUN ls -la dist/ || echo "Build failed - no dist folder created"
RUN find . -name "*.js" -path "./dist/*" || echo "No JS files found in dist"

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]