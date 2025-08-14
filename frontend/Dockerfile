# Base Image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port that Vite uses (default is 5173)
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
