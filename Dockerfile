FROM node:8

# Create app directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install app dependencies
COPY package*.json ./

RUN npm install

EXPOSE 8080

# Define environment variable
ENV NAME .env


CMD [ "npm", "start" ]