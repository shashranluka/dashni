FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY server.js ./
COPY controllers ./controllers
COPY routes ./routes

# Expose port
EXPOSE 8800

# Start application
CMD ["node", "server.js"]
