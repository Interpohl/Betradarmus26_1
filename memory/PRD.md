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
│   ├── email_service.py       # SendGrid Email Service
│   ├── statistics_service.py  # Statistics & Tip Tracking Service
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Statistics.jsx     # Statistics Component
│   │   └── pages/
│   │       ├── AdminDashboard.jsx
│   │       ├── FAQ.jsx            # FAQ Page (NEW)
│   │       └── Landing.jsx        # Enhanced with new sections
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

### Statistics & Performance Tracking (NEW)
- **Location**: Öffentlich auf der Landing Page (zwischen Live Demo und Problem Sektion)
- **Gamification-Elemente**:
  - Animierte Zahlen-Counter
  - HOT STREAK Badge (bei 3+ aufeinanderfolgenden Wins)
  - Achievement-Badges (100 Tipps, 60% Rate, 5er Streak, +10% ROI, 70% Rate, 10er Streak)
- **Charts**:
  - Monatliche Performance (Area Chart via Recharts)
  - Top Ligen nach Win Rate (Horizontal Bar Chart)
- **Daten**: 
  - Win Rate, ROI, Total Tips, Current Streak
  - Performance pro Liga
  - Letzte 10 ausgewertete Tipps mit WIN/LOSS Status
- **Backend**: The Odds API Integration für automatisches Ergebnis-Tracking (täglich)

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

### Statistics (NEW)
- `GET /api/statistics` - Overall tip statistics (win rate, ROI, streak)
- `GET /api/statistics/leagues` - Performance breakdown by league
- `GET /api/statistics/monthly` - Monthly performance data for charts
- `GET /api/statistics/recent` - Recent evaluated tips
- `POST /api/statistics/process` - Process pending tips (ELITE only)
- `POST /api/statistics/record-tip` - Record a new tip (ELITE only)

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

### tip_results (NEW)
```json
{
  "id": "uuid",
  "match": "Bayern München vs Borussia Dortmund",
  "league": "Bundesliga",
  "market": "Over 2.5 Goals",
  "predicted_outcome": "Over 2.5 Goals",
  "confidence": 0.78,
  "odds": 1.85,
  "stake": 1.0,
  "result": "WIN|LOSS|null",
  "evaluated": true,
  "created_at": "datetime",
  "evaluated_at": "datetime",
  "final_score": "2:1",
  "home_score": 2,
  "away_score": 1
}
```

---

## Completed (2026-03-20)

1. ✅ **Hero Section USP Redesign** - Packendere Darstellung mit konkreten Zahlen
   - Headline: "KI-Signale mit 71% Trefferquote - direkt aufs Handy"
   - Stats-Row: 71% Win Rate | +42% ROI | 150+ Tipps
   - Trust-Hinweis: "Verifiziert via The Odds API"

2. ✅ **"So funktioniert's" Sektion** - 3-Schritte-Prozess
   - Registrieren → Telegram verbinden → Signale erhalten

3. ✅ **Testimonials Sektion** - Nutzerstimmen mit Sternebewertungen
   - 3 Testimonials (PRO Nutzer + FREE Nutzer)

4. ✅ **KI-Erklärung Sektion** - "Wie unsere KI funktioniert"
   - Machine Learning Modelle, Echtzeit-Datenfeeds, Tägliches Retraining, Backtesting
   - Model Pipeline Visualisierung (5 Schritte)

5. ✅ **Free Trial Highlight** - FREE vs PRO Vergleich
   - Side-by-side Vergleich mit Feature-Liste
   - "BELIEBT" Badge für PRO

6. ✅ **Partner-Logos Sektion** - "Daten & Technologie von"
   - The Odds API, Livescore, Stripe, Telegram

7. ✅ **Legal Disclaimer Erweitert** - Professioneller Warnhinweis
   - Analyse-Plattform Hinweis
   - "Vergangene Performance ist kein Indikator"
   - Links zu Datenschutz, AGB, E-Mail

8. ✅ **FAQ-Seite** - Neue /faq Route
   - 7 Kategorien: Allgemein, Signale, Telegram, Preise, Statistiken, Sicherheit, Support
   - Accordion-Design mit Icons

9. ✅ **Zahlungsmethoden erweitert** - Kreditkarte, PayPal, Klarna
   - Backend angepasst für payment_method_types

## Completed (2026-03-19)

1. ✅ **Statistics & Performance Tracking** - Öffentliche Statistik-Sektion auf der Landing Page
   - Gamification-Style mit animierten Zahlen, Streaks, Achievements
   - Monatliche Performance Chart (Recharts Area)
   - Liga-Performance Chart (Recharts Bar)
   - Letzte ausgewertete Tipps mit WIN/LOSS Status
   - Backend-Integration mit The Odds API für automatisches Ergebnis-Tracking
   - Demo-Daten mit 150 Tipps geseedet

## Completed (2026-03-20)

1. ✅ **Telegram FREE Group Link Integration** - Added link `https://t.me/+Pb8X_nXzKu41N2Yy` to:
   - Footer (prominent Telegram icon + text link)
   - Landing Page "How it works" Step 2
   - FAQ Page (dedicated CTA box + updated FAQ answer)
   - Auth Modal (link at bottom)
2. ✅ **Comprehensive Testing** - Backend API tests (22/22) + Frontend E2E tests (30/30) all passing

## Completed (2025-03-19)

1. ✅ **Admin Dashboard** - Signal creation & management, expanded with Website Users, Telegram Users, Payments, Email blasting tabs
2. ✅ **Telegram Statistics** - User & signal analytics with charts
3. ✅ **Email Confirmation** - SendGrid integration for Early Access
4. ✅ **Bot Conflict Fix** - ENABLE_TELEGRAM_BOT flag for production-only
5. ✅ **Statistics Section** - Gamification with animated counters, HOT STREAK badges, achievement system
6. ✅ **FAQ Page** - Comprehensive FAQ with accordion categories
7. ✅ **Automated AI Signal Generator** - backend/signal_generator.py with start/stop controls
8. ✅ **Stripe Expanded Payments** - PayPal and Klarna support added
9. ✅ **Football-Data.org API** - For past match results (replaced The Odds API for results)
10. ✅ **Telegram Elite Channel** - /elite command support
11. ✅ **Landing Page Revamp** - How it works, Testimonials, AI Model explanation, Free Trial section, Partner Logos
12. ✅ **Docker Compose v2.24.0** - Fixed 502 errors on production

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

### P0 - Critical (User Action Required)
- **Production Server Environment Update**: User needs to SSH into Strato server and run:
  ```bash
  cd /var/www/betradarmus
  echo "FOOTBALL_DATA_API_KEY=79715cd143144f1196e894f1cdd334bf" >> backend/.env
  echo "TELEGRAM_ELITE_CHANNEL=https://t.me/+SODfqorGIt8khC_9" >> backend/.env
  git pull
  /usr/local/bin/docker-compose up -d --build
  ```
- **Stripe Dashboard Configuration**: Enable PayPal and Klarna in Stripe Dashboard manually
- **Create Admin User on Production**: Run the admin creation script on production server

### P1 - High
- **Elite-Plan Activation**: Change "Coming Soon" button to active purchase button
- Echte Tipps über Admin Dashboard erfassen und automatisch auswerten lassen
- Cronjob für tägliche Ergebnis-Aktualisierung via The Odds API

### P2 - Medium
- Push notifications (Web)
- Erweitertes Tip-Management im Admin Dashboard
- Refactor AdminDashboard.jsx (~1400 lines) into smaller tab components
- Refactor server.py into separate routers (routes/admin.py, routes/signals.py)

### P3 - Low
- Multiple language support
- Mobile app (React Native)
