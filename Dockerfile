FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json for better caching
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --production

# Copy only necessary files
COPY src/ ./src/
COPY .env ./

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "src/index.js"]
