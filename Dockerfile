# 1. Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
#
# Install dependencies
COPY package.json ./
RUN yarn install --frozen-lockfile

# Build Next.js app
COPY . .
ENV NODE_ENV production

RUN npm ci --legacy-peer-deps
RUN npm run build

# 2. Production Stage (only copies the necessary files)
FROM node:20-alpine AS runner
WORKDIR /app

# Set the Next.js production environment
ENV NODE_ENV production

# Copy the necessary files from the builder stage
# The 'standalone' output includes the server and node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cloud Run/Next.js Port Configuration (see Section 2)
# Expose the default Next.js production port
EXPOSE 3000
ENV PORT 3000 

# Start the server (server.js is the standalone entry point)
CMD ["node", "server.js"]
