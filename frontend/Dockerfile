FROM node:22-alpine3.20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json for dependency installation
COPY ./vite-project/package.json ./vite-project/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY ./vite-project .

# Expose the application port
EXPOSE 2000

# Start the application in preview mode
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "2000"]zz