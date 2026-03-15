# Multi-stage build for Node.js server

# Stage 1: Dependencies
FROM node:20-alpine AS dependencies
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++ ffmpeg

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install ffmpeg for video processing
RUN apk add --no-cache ffmpeg

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy dependencies from stage 1
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/videos uploads/thumbnails uploads/temp
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]
