FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
# COPY server.js ./
# COPY controllers ./controllers
# COPY routes ./routes
# COPY middleware ./middleware
COPY . .


# Expose port
EXPOSE 8800

# ცხადად ვაფიქსირებთ: შეცდომის დეტალები გარეთ არ უნდა გავიდეს.
ENV NODE_ENV=production

# Start application
CMD ["node", "server.js"]
