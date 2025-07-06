# Use official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.53.2-noble

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=test
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Create app user (for security)
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Change ownership of app directory
RUN chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Install browsers (already included in the base image but ensuring latest)
RUN npx playwright install

# Create directories for reports and screenshots
RUN mkdir -p reports test-results screenshots

# Expose port for debugging (optional)
EXPOSE 9229

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Default command
CMD ["npm", "test"]