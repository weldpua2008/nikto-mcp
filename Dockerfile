# Use the official Nikto Docker image as base
FROM ghcr.io/sullo/nikto:latest

# Install Node.js 18 (LTS) for the MCP server
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source code
COPY dist/ ./dist/
COPY index.js ./

# Set environment variables for Docker mode
ENV NIKTO_MODE=local
ENV NIKTO_BINARY=/opt/nikto/program/nikto.pl
ENV LOG_LEVEL=info
ENV SCAN_TIMEOUT=3600
ENV MAX_CONCURRENT_SCANS=3

# Create non-root user for security
RUN useradd -m -s /bin/bash mcpuser && \
    chown -R mcpuser:mcpuser /app

USER mcpuser

# Expose port if needed (optional, MCP typically uses stdin/stdout)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('MCP Server healthy')" || exit 1

# Default command
CMD ["node", "index.js"]
