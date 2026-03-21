# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Dependencies - only package.json required
COPY package.json ./
RUN yarn install

# Build
COPY . .
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=build /app/build /usr/share/nginx/html

# Nginx config with caching, gzip, and React Router support
RUN cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript application/xml application/json;
    gzip_comp_level 6;

    # Cache static assets (JS, CSS, images) for 1 year
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Cache HTML for 1 hour (for updates)
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, max-age=3600";
    }

    # React Router - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
