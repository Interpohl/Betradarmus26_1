# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Dependencies - yarn.lock is optional
COPY package.json ./
COPY yarn.lock* ./
RUN yarn install

# Build
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config for React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
