# Step 1: Build the Vite app
FROM node:23-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Use "serve" to serve the static files
FROM node:23-alpine

WORKDIR /app

# Install "serve"
RUN npm install -g serve

# Copy built files from previous stage
COPY --from=build /app/dist .

EXPOSE 5174 

CMD ["serve", "-s", ".", "-l", "5174"]

