# BETRADARMUS - Product Requirements Document

## Original Problem Statement
Modern, high-quality, trustworthy SaaS website for an AI startup named "BETRADARMUS".
Claim: "Live football intelligently analyzed."

## Product Overview
An AI-powered live sports analysis platform for football, analyzing live markets, probabilities, and market inefficiencies in real-time. It is NOT a betting provider.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe (official Python SDK)
- **Live Data**: Hybrid solution - The Odds API (prematch odds) + Livescore.com (live scores)
- **Signal Distribution**: Telegram Bot (python-telegram-bot)
- **Email**: SendGrid
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server
- **CI/CD**: GitHub Actions

## Current Architecture
```
/app
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── telegram_service.py    # Telegram Bot Service
│   ├── email_service.py       # SendGrid Email Service (NEW)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   └── pages/
│   │       └── AdminDashboard.jsx  # Admin Dashboard (NEW)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy-strato.yml
```

## Server Configuration (Strato V-Server: 87.106.8.138)
- **Frontend**: Port 3000 → nginx → betradarmus.de (SSL)
- **Backend**: Port 8005 → nginx → api.betradarmus.de (SSL)
- **MongoDB**: Internal Docker network
- **Telegram Bot**: Polling mode (only on production via ENABLE_TELEGRAM_BOT=true)

## Environment Variables
```
# Backend .env (Production)
MONGO_URL=...
TELEGRAM_BOT_TOKEN=...
ENABLE_TELEGRAM_BOT=true        # Only true on production!
SENDGRID_API_KEY=...
SENDER_EMAIL=info@betradarmus.de
SENDER_NAME=BETRADARMUS
```

---

## Features Implemented

### Admin Dashboard (/admin)
- **Tabs**: Übersicht, Statistiken, Signale, Nutzer
- **Signal Creation**: Create and distribute signals to Telegram users
- **Statistics**: 
  - Subscription breakdown (FREE/PRO/ELITE)
  - League subscription stats
  - Signal performance metrics
  - Visual pie chart for user distribution
- **Access**: ELITE users only

### Telegram Signal Distribution
- **Bot**: @Betradarmus_bot
- **Commands**: /start, /settings, /subscribe, /unsubscribe, /status, /help
- **Features**:
  - User registration
  - League subscription
  - Signal filtering by league, confidence, subscription level
  - Rate limiting (25 msg/sec)
- **Conflict Resolution**: Bot only runs on production (ENABLE_TELEGRAM_BOT=true)

### Email Confirmation (SendGrid)
- **Trigger**: Early Access signup
- **Template**: Professional HTML email with BETRADARMUS branding
- **Sender**: info@betradarmus.de
- **Content**: Plan selection, feature list, Telegram bot link

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Signals
- `POST /api/signals` - Create signal (ELITE only)
- `GET /api/signals` - List signals
- `GET /api/signals/{id}` - Get specific signal

### Telegram
- `GET /api/telegram/status` - Bot status
- `GET /api/telegram/leagues` - Available leagues
- `GET /api/telegram/users` - List users (ELITE only)
- `POST /api/telegram/broadcast` - Broadcast message (ELITE only)

### Early Access
- `POST /api/early-access` - Register + send confirmation email

---

## Database Schema

### telegram_users
```json
{
  "telegram_id": "string",
  "telegram_username": "string",
  "first_name": "string",
  "subscription_level": "free|pro|elite",
  "leagues": ["Bundesliga", "..."],
  "min_confidence": 0.75,
  "alerts_enabled": true,
  "signals_today": 0
}
```

### signals
```json
{
  "id": "uuid",
  "league": "string",
  "match": "string",
  "market": "string",
  "confidence": 0.78,
  "risk_score": 41,
  "explanation": "string",
  "distributed": true,
  "distribution_results": {"sent": 10, "filtered": 5, "failed": 0}
}
```

### early_access
```json
{
  "id": "uuid",
  "email": "string",
  "plan_interest": "free|pro|elite",
  "email_confirmed": true,
  "confirmation_sent_at": "datetime"
}
```

---

## Completed (2025-03-19)

1. ✅ **Admin Dashboard** - Signal creation & management
2. ✅ **Telegram Statistics** - User & signal analytics with charts
3. ✅ **Email Confirmation** - SendGrid integration for Early Access
4. ✅ **Bot Conflict Fix** - ENABLE_TELEGRAM_BOT flag for production-only

## Completed (2025-03-11)

1. ✅ Production deployment fix (port 8005)
2. ✅ CI/CD Pipeline (GitHub Actions)
3. ✅ SSL for api.betradarmus.de
4. ✅ Google Search Console verification
5. ✅ Telegram Bot implementation

---

## 3rd Party Integrations
- **Stripe**: Payment processing
- **The Odds API**: Prematch odds
- **Livescore.com**: Live scores
- **Telegram Bot API**: Signal distribution
- **SendGrid**: Email service

## Credentials
- **Server**: ssh root@87.106.8.138
- **GitHub**: https://github.com/Interpohl/Betradarmus26_1
- **Telegram Bot**: @Betradarmus_bot
- **SendGrid Sender**: info@betradarmus.de

---

## Future Tasks / Backlog

### P2 - Medium
- Push notifications (Web)
- Historical signal performance tracking

### P3 - Low
- Multiple language support
- Mobile app (React Native)
