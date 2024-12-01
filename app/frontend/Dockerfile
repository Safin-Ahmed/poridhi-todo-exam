# Base Layer
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the frontend source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Start the frontend server
CMD ["npm", "run", "start"]

