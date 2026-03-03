# BETRADARMUS - Strato V-Server Deployment Guide

## Voraussetzungen auf dem V-Server

1. **SSH-Zugang** zu Ihrem Strato V-Server
2. **Docker & Docker Compose** installiert
3. **Domain** auf V-Server IP zeigen lassen

---

## 1. V-Server Initial Setup

Verbinden Sie sich per SSH:
```bash
ssh root@IHRE-VSERVER-IP
```

### Docker installieren (falls nicht vorhanden):
```bash
# Ubuntu/Debian
apt update && apt upgrade -y
apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx

# Docker starten
systemctl enable docker
systemctl start docker
```

---

## 2. Projekt auf V-Server klonen

```bash
# Projektverzeichnis erstellen
mkdir -p /var/www
cd /var/www

# Repository klonen (nach GitHub Export)
git clone https://github.com/IHR-USERNAME/betradarmus.git
cd betradarmus
```

---

## 3. Umgebungsvariablen konfigurieren

```bash
# Backend .env erstellen
cat > backend/.env << 'EOF'
MONGO_URL=mongodb://mongodb:27017
DB_NAME=betradarmus
CORS_ORIGINS=https://betradarmus.de,https://www.betradarmus.de
STRIPE_API_KEY=sk_live_XXXX
SOFASCORE_API_KEY=XXXX
JWT_SECRET_KEY=GENERATE_A_SECURE_KEY_HERE
EOF

# Frontend .env erstellen
cat > frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=https://api.betradarmus.de
EOF
```

---

## 4. Mit Docker Compose starten

```bash
docker-compose up -d --build
```

---

## 5. Nginx als Reverse Proxy

```bash
# Nginx Konfiguration erstellen
cat > /etc/nginx/sites-available/betradarmus << 'EOF'
# Frontend
server {
    listen 80;
    server_name betradarmus.de www.betradarmus.de;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.betradarmus.de;
    
    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Aktivieren
ln -s /etc/nginx/sites-available/betradarmus /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 6. SSL-Zertifikat (HTTPS)

```bash
certbot --nginx -d betradarmus.de -d www.betradarmus.de -d api.betradarmus.de
```

---

## 7. DNS bei Strato konfigurieren

In der Strato Domain-Verwaltung:

| Typ | Name | Ziel |
|-----|------|------|
| A | @ | IHRE-VSERVER-IP |
| A | www | IHRE-VSERVER-IP |
| A | api | IHRE-VSERVER-IP |

---

## Automatische Updates

Nach dem Setup von GitHub Actions werden Änderungen automatisch deployed.
