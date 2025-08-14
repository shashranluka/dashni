# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV=production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /usr/src/app

# Create node user home directory and set ownership
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./

# Switch to node user before installing packages
USER node

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the source files
COPY --chown=node:node . .

# Expose the port
EXPOSE 8800

# Use dumb-init for proper signal handling
CMD ["dumb-init", "npm", "start"]
