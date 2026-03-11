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
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server
- **CI/CD**: GitHub Actions

## Current Architecture
```
/app
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── telegram_service.py    # Telegram Bot Service (NEW)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy-strato.yml
```

## Server Configuration (Strato V-Server: 87.106.8.138)
- **Frontend**: Port 3000 → nginx → betradarmus.de (SSL)
- **Backend**: Port 8005 → nginx → api.betradarmus.de (SSL)
- **MongoDB**: Internal Docker network
- **Telegram Bot**: Polling mode on backend

---

## Telegram Signal Distribution System (NEW)

### Bot Commands
- `/start` - Register user
- `/settings` - Show/change settings
- `/subscribe` - Subscribe to leagues
- `/unsubscribe` - Unsubscribe from leagues
- `/status` - Show current status
- `/help` - Show help

### Subscription Levels
| Level | Max Leagues | Min Confidence | Signals/Day |
|-------|-------------|----------------|-------------|
| FREE  | 2           | 75%            | 5           |
| PRO   | 5           | 60%            | 50          |
| ELITE | 8           | 50%            | Unlimited   |

### Available Leagues
- Bundesliga, 2. Bundesliga
- Premier League
- La Liga
- Serie A
- Ligue 1
- Champions League
- Europa League

### Signal Message Format
```
⚡ BETRADARMUS LIVE SIGNAL

🏟️ Spiel: Dortmund vs Leipzig
🏆 Liga: Bundesliga

📊 Markt: Over 2.5
🟢 Confidence: 78%
🟡 Risk Score: 41

📝 Analyse:
Market deviation detected.

🕐 Zeit: 20:17
```

---

## Key API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Payments
- `POST /api/payments/checkout` - Create Stripe checkout
- `GET /api/payments/status/{session_id}` - Check payment status

### Live Data
- `GET /api/analysis/opportunities` - Live market opportunities (hybrid data)
- `GET /api/livescore/live` - Live scores from Livescore.com
- `GET /api/odds/live` - Odds from The Odds API

### Signals (NEW)
- `POST /api/signals` - Create signal (ELITE only)
- `GET /api/signals` - List signals
- `GET /api/signals/{signal_id}` - Get specific signal

### Telegram (NEW)
- `GET /api/telegram/status` - Bot status
- `GET /api/telegram/leagues` - Available leagues
- `GET /api/telegram/users` - List users (ELITE only)
- `PUT /api/telegram/users/{id}/settings` - Update user settings
- `POST /api/telegram/broadcast` - Broadcast message (ELITE only)
- `POST /api/telegram/link` - Link web account to Telegram

### Other
- `POST /api/early-access` - Early access signup
- `POST /api/contact` - Contact form
- `GET /api/plans` - Subscription plans

---

## Database Schema

### users
```json
{
  "id": "uuid",
  "email": "string",
  "password_hash": "string",
  "name": "string",
  "subscription": "free|pro|elite",
  "telegram_linked": "boolean",
  "telegram_id": "string",
  "created_at": "datetime"
}
```

### telegram_users (NEW)
```json
{
  "telegram_id": "string",
  "telegram_username": "string",
  "first_name": "string",
  "subscription_level": "free|pro|elite",
  "leagues": ["Bundesliga", "..."],
  "min_confidence": 0.75,
  "alerts_enabled": true,
  "signals_today": 0,
  "web_user_id": "string (optional)",
  "created_at": "datetime"
}
```

### signals (NEW)
```json
{
  "id": "uuid",
  "sport": "football",
  "league": "string",
  "match": "string",
  "market": "string",
  "confidence": 0.78,
  "risk_score": 41,
  "explanation": "string",
  "created_by": "user_id",
  "distributed": true,
  "distribution_results": {"sent": 10, "filtered": 5, "failed": 0},
  "timestamp": "datetime"
}
```

---

## 3rd Party Integrations
- **Stripe**: Payment processing
- **The Odds API**: Prematch odds
- **Livescore.com**: Public API for live scores
- **Telegram Bot API**: Signal distribution

---

## Completed Features ✅

### 2025-03-11 - Telegram Signal Distribution
- Implemented Telegram Bot with python-telegram-bot
- Bot commands: /start, /settings, /subscribe, /unsubscribe, /status, /help
- User registration and league subscription
- Signal distribution with filtering (league, confidence, subscription level)
- Rate limiting (25 messages/second)
- In-memory queue for message delivery
- REST API for signal management

### 2025-03-11 - Production Deployment & CI/CD
- Fixed port conflict (Backend on port 8005)
- Fixed nginx syntax error
- Configured SSL for api.betradarmus.de
- Set up GitHub Actions CI/CD pipeline
- Google Search Console verified

### Previous Completions
- Full landing page with Hero, Problem, Solution, Technology, Pricing sections
- Legal pages: Impressum, AGB, Datenschutz
- Contact page with company details
- User authentication (JWT)
- Stripe payment integration
- Live data integration (hybrid: Livescore.com + The Odds API)
- Dashboard with LIVE, STARTING SOON, and PREMATCH tabs

---

## Pending/Future Tasks

### P2 - Medium Priority
- Email confirmation for Early Access sign-ups
- Admin dashboard for signal management (Frontend)
- Telegram user statistics dashboard

### P3 - Low Priority
- Push notifications (Web)
- Historical signal performance tracking
- Multiple language support

---

## Credentials
- **Server SSH**: `ssh root@87.106.8.138`
- **GitHub Repo**: `https://github.com/Interpohl/Betradarmus26_1`
- **Telegram Bot**: `@Betradarmus_Bot`
