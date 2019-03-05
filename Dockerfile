FROM keymetrics/pm2:latest-alpine

# Create app directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install app dependencies
COPY package*.json ./
COPY ecosystem.config.js ./


ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --quiet

EXPOSE 8008

# Define environment variable
ENV NAME .env


CMD [ "pm2-runtime", "start", "ecosystem.config.js"]