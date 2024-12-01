# Base Image
FROM node:18

# Set the working directory inside the container
WORKDIR /app 

# Copy package.json and install dependencies
COPY package.json tsconfig.json ./
RUN npm install

# Copy the source code into the container
COPY src ./src

# Copy the .env file into the container
COPY .env .env

# Expose the backend port
EXPOSE 4000 

# Run the backend server
CMD ["npm", "run", "dev"]