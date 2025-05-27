# Use a lightweight Node.js image
FROM node:22-alpine3.20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY ./vite-project/package.json ./vite-project/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]