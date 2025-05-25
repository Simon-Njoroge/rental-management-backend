# Use Node.js v16 with Alpine (lightweight)
FROM node:18-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package files (package.json and pnpm-lock.yaml if exists)
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy all other source code
COPY . .

# Build the TypeScript code (if you have a build script)
RUN pnpm run build

# Expose the port your app listens on
EXPOSE 3000

# Start the app using pnpm
CMD ["pnpm", "run", "start"]
