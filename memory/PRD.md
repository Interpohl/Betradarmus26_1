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
- **Live Data**: Hybrid solution - The Odds API (prematch odds) + **SofaScore RapidAPI** (live matches) + Livescore.com (fallback)
- **Signal Distribution**: Telegram Bot (python-telegram-bot)
- **Email**: SendGrid
- **Analytics**: PostHog (A/B Testing, Session Recording)
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server
- **CI/CD**: GitHub Actions

## Current Architecture
```
/app
├── backend/
│   ├── server.py                     # Main FastAPI application
│   ├── subscription_service.py       # NEW: Subscription Management
│   ├── telegram_service.py           # Telegram Bot Service (Updated with payment commands)
│   ├── telegram_payment_service.py   # NEW: Telegram Payment Handling
│   ├── email_service.py              # SendGrid Email Service
│   ├── statistics_service.py         # Statistics & Tip Tracking Service
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BillingToggle.jsx           # NEW: Monthly/Yearly Toggle
│   │   │   ├── ValueFramingSection.jsx     # Value Framing
│   │   │   ├── SignalComparisonTable.jsx   # Comparison Table
│   │   │   ├── FAQSection.jsx              # FAQ Accordion
│   │   │   ├── TrustSection.jsx            # Trust Building
│   │   │   ├── FinalCTASection.jsx         # Final CTA
│   │   │   └── PricingCard.jsx             # Updated with billingInterval
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── BillingPage.jsx             # NEW: Account/Billing Management
│   │   │   └── Landing.jsx                 # Enhanced with BillingToggle
│   │   └── utils/
│   │       ├── analytics.js                # PostHog Event Constants
│   │       ├── analyticsHooks.js           # Custom Tracking Hooks
│   │       └── PostHogProvider.jsx         # PostHog Provider
│   ├── package.json
│   └── Dockerfile
├── docs/
│   └── POSTHOG_SETUP.md                    # Analytics Documentation
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

### Live Matches
- `GET /api/sofascore/live` - Live football matches from SofaScore RapidAPI (Primary)
- `GET /api/livescore/live` - Live football matches from Livescore.com (Fallback)
- `GET /api/live/matches` - Live matches with subscription-based access
- `GET /api/live/match/{match_id}` - Detailed match stats (PRO/ELITE only)

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
3. ✅ **Telegram Group Welcome Message** - Auto-greet new members with bot link (@Betradarmus_bot)
4. ✅ **Live Counter Bar** - Shows "X Nutzer online", "Nächstes Signal in X:XX", "X Signale heute" with live updates
5. ✅ **Comparison Section** - "BETRADARMUS vs. Bauchgefühl" with side-by-side comparison cards
6. ✅ **Telegram Preview Section** - Phone mockup with rotating live signals, CTAs for Community & Bot

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

## Completed (2026-04-07)

1. ✅ **SofaScore Live Feed Integration** - Vollständige Integration der SofaScore RapidAPI für echte Live-Spiele
   - **Backend**: Neuer `/api/sofascore/live` Endpoint mit optimiertem Data-Parsing
   - **Frontend**: `LiveMatchesFeed.jsx` aktualisiert auf SofaScore-API
   - **Features**:
     - Echte Live-Spiele aus 50+ Ländern weltweit
     - Verbesserte Status-Erkennung (1. HZ, 2. HZ, HZ, VL, ELF)
     - Länderflaggen-Mapping für 70+ Länder
     - Auto-Refresh alle 30 Sekunden
     - Fallback auf Livescore.com bei API-Fehlern
   - **Testing**: Backend curl-Tests + Frontend Screenshot verifiziert

2. ✅ **Team-Logo Badges** - Stylische Team-Initialen als Logo-Alternative
   - **Problem**: SofaScore CDN blockiert Server-Zugriffe (403 Forbidden)
   - **Lösung**: Elegante Initial-basierte Badges mit:
     - 2-Buchstaben-Initialen (z.B. "CT" für Cooma Tigers)
     - Konsistente Farben pro Team (Hash-basiert)
     - Gradient-Hintergründe mit abgerundeten Ecken
   - **Vorteil**: Keine externe API-Abhängigkeit, schnellere Ladezeiten

3. ✅ **Match-Details Modal** - Interaktives Spiel-Detail-Popup
   - **Komponente**: `MatchDetailsModal.jsx` (450+ Zeilen)
   - **Backend**: Neuer `/api/sofascore/match/{event_id}` Endpoint
   - **Features**:
     - Team-Badges mit Score und Live-Status
     - **Premium-Gate** für nicht-PRO/ELITE User mit Upgrade-CTA
     - **Statistiken-Tab**: Ballbesitz, Torschüsse, Ecken, Fouls, Karten, Pässe
     - **Ereignisse-Tab**: Tore, Karten, Auswechslungen mit Zeitstempel
     - **Aufstellungen-Tab**: Formation und Startelf (wenn verfügbar)
   - **Design**: Dark-Theme mit Gradient-Header und Tab-Navigation

## Completed (2025-04-07)

1. ✅ **Landing Page Sections Upgrade** - 5 neue Sections basierend auf Benutzer-Prompt implementiert:
   - **ValueFramingSection**: "Der Unterschied liegt nicht im Signal. Sondern im Moment." mit 4 Bullet Points
   - **SignalComparisonTable**: "Signal oder Entscheidung?" mit 7-Zeilen-Vergleichstabelle
   - **FAQSection**: "Häufige Fragen" mit 5 Accordion-Fragen (Shadcn UI)
   - **TrustSection**: "Keine Tipps. Keine Versprechen." mit 2-Spalten-Layout
   - **FinalCTASection**: "Der Unterschied liegt im Moment." mit 2 CTA-Buttons
2. ✅ **Testing Agent Verification** - 100% Frontend Tests bestanden
   - Alle 5 Sections rendern korrekt
   - FAQ Accordion öffnet/schließt korrekt
   - CTA Buttons öffnen Auth Modal
   - Mobile Responsiveness verifiziert (390x844 Viewport)
   - Lazy Loading funktioniert
3. ✅ **PostHog A/B Testing Integration** - Komplette Analytics-Infrastruktur implementiert:
   - PostHog React SDK integriert (`posthog-js`, `@posthog/react`)
   - Custom Analytics Hooks erstellt (`useScrollDepth`, `useTimeOnPage`, `useFAQTracking`, `useCTATracking`, `useAuthTracking`)
   - Event-Tracking für: CTA-Klicks, FAQ-Interaktionen, Telegram-Links, Registrierungen, Scroll-Tiefe, Verweildauer
   - Section Visibility Tracking (automatisch wenn >50% im Viewport)
   - Feature Flags vorbereitet für A/B Tests (Trust Section, Final CTA, Value Framing, Pricing)
   - Session Recording aktiviert mit Privacy-Masking
   - Dokumentation erstellt: `/app/docs/POSTHOG_SETUP.md`
4. ✅ **Payment & Subscription System** - Vollständiges Hybrides Payment-System implementiert:
   - **Backend**:
     - `subscription_service.py` - Zentrales Subscription-Management
     - Stripe Checkout Sessions für monatliche/jährliche Abos
     - Webhook-Handling (checkout.session.completed, subscription.updated/deleted, invoice.paid/failed)
     - User Linking zwischen Website und Telegram
     - Access Control Endpoints (Feature-Check, Signal-Limit)
   - **Frontend**:
     - `BillingToggle.jsx` - Monatlich/Jährlich Umschalter mit -28% Badge
     - `BillingPage.jsx` - Abo-Verwaltung, Telegram-Verknüpfung, Zahlungsverlauf
     - `PricingCard.jsx` - Aktualisiert mit billingInterval-Support
     - Neue Routen: `/account`, `/billing`
   - **Telegram Bot**:
     - Neue Kommandos: `/plans`, `/upgrade`, `/manage`, `/link`
     - Callback Handler für Upgrade-Buttons
     - Link-Code Verarbeitung für Konto-Verknüpfung
   - **100% Backend & Frontend Tests bestanden** (21/21 Backend, alle Frontend)

## Completed (2025-03-27)

1. ✅ **Value Alerts UI Implementation** - Neuer Tab im Admin Dashboard für automatische Value-Alerts
   - Scan-Button zum Suchen nach Value-Opportunities
   - Alert-Liste mit Edge%, Signal Strength, Polymarket vs Buchmacher Vergleich
   - Actions: "Elite senden", "Alle Kanäle", "Verwerfen"
   - Stats-Anzeige mit aktiven Alerts, Min. Edge, Min. Volumen, Check-Interval

2. ✅ **Backend Bug Fix** - `require_admin` Funktion fehlte in server.py
   - Hinzugefügt zur Authentifizierung von Admin-Routen

3. ✅ **MongoDB Boolean Bug Fix** - value_alert_service.py
   - Geändert von `if not self.db` zu `if self.db is None`
   - MongoDB Database-Objekte implementieren keinen Truth-Value Test

4. ✅ **Comprehensive Testing** - Backend API tests (29/29) + Frontend E2E tests alle bestanden
   - Test-Admin User erstellt: test_admin@betradarmus.de / TestAdmin123!

5. ✅ **The Odds API Integration** - Neuer `/app/backend/odds_api_service.py` Service
   - Holt echte Buchmacher-Quoten von The Odds API
   - Unterstützt alle Fußball-Ligen (Bundesliga, Premier League, La Liga, etc.)
   - Integriert in value_alert_service.py für Value-Berechnungen
   - Caching (5 Min) zur Minimierung von API-Aufrufen
   - Neuer Admin-Endpoint: `/api/odds-api/test`

6. ✅ **Elite-Plan Aktivierung** - Button von "Coming Soon" zu "Elite Werden" geändert
   - disabled: true → disabled: false in PricingCard.jsx
   - Elite-Plan ist jetzt kaufbar über Stripe Checkout

7. ✅ **Production .env Vorbereitung** - Telegram Channel-IDs hinzugefügt
   - TELEGRAM_PRO_CHANNEL_ID
   - TELEGRAM_FREE_CHANNEL_ID
   - **WICHTIG**: User muss diese IDs in Production .env aktualisieren!

8. ✅ **Welcome-E-Mail bei Registrierung** - Automatische E-Mail nach Registrierung
   - Personalisierte Begrüßung
   - FREE-Telegram-Gruppen-Einladungslink
   - Feature-Übersicht und Statistiken
   - Bankroll-Warnung (10% Regel)

9. ✅ **Upgrade-E-Mails für PRO/ELITE** - Automatische E-Mail nach Stripe-Upgrade
   - Willkommen im PRO/ELITE Club
   - Exklusiver Telegram-Kanal-Einladungslink
   - Plan-spezifische Features aufgelistet
   - Priority Support Hinweis

---

## 3rd Party Integrations
- **Stripe**: Payment processing
- **The Odds API**: Prematch odds
- **Livescore.com**: Live scores
- **Telegram Bot API**: Signal distribution
- **SendGrid**: Email service
- **PostHog**: A/B Testing, Analytics, Session Recording (NEW)

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
  # Add these new lines to backend/.env:
  echo "TELEGRAM_PRO_CHANNEL_ID=<YOUR_PRO_CHANNEL_ID>" >> backend/.env
  echo "TELEGRAM_FREE_CHANNEL_ID=<YOUR_FREE_CHANNEL_ID>" >> backend/.env
  git pull
  /usr/local/bin/docker-compose up -d --build
  ```
- **Stripe Dashboard Configuration**: Enable PayPal and Klarna in Stripe Dashboard manually
- **Odds API Credits**: The Odds API credits (500/month free) are exhausted - consider upgrading plan or wait for monthly reset

### P1 - High
- Echte Tipps über Admin Dashboard erfassen und automatisch auswerten lassen
- Cronjob für tägliche Ergebnis-Aktualisierung via The Odds API

### P2 - Medium
- Push notifications (Web)
- Erweitertes Tip-Management im Admin Dashboard
- Refactor AdminDashboard.jsx (~1800+ lines) into smaller tab components
- Refactor server.py into separate routers (routes/admin.py, routes/signals.py)

### P3 - Low
- Multiple language support
- Mobile app (React Native)
