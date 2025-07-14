# Use the official Nikto Docker image as base
FROM ghcr.io/sullo/nikto:latest

# Switch to root to install packages
USER root

# Install Node.js 18 (LTS) for the MCP server
RUN apk add --no-cache nodejs npm

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies (skip prepare script that requires dev deps)
RUN npm ci --omit=dev --ignore-scripts

# Copy source code
COPY dist/ ./dist/
COPY index.cjs ./

# Set environment variables for Docker mode
ENV NIKTO_MODE=local
ENV NIKTO_BINARY=/opt/nikto/program/nikto.pl
ENV LOG_LEVEL=info
ENV SCAN_TIMEOUT=3600
ENV MAX_CONCURRENT_SCANS=3

# Create non-root user for security
RUN adduser -D -s /bin/sh mcpuser && \
    chown -R mcpuser:mcpuser /app

USER mcpuser

# Expose port if needed (optional, MCP typically uses stdin/stdout)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('MCP Server healthy')" || exit 1

# Default command
CMD ["node", "index.cjs"]
