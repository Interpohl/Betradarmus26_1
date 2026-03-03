# BETRADARMUS - Product Requirements Document

## Original Problem Statement
Modern, high-quality, trustworthy SaaS website for AI startup "BETRADARMUS" - Live football intelligently analyzed. AI-powered live sports analysis platform for football markets.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe (test mode)
- **Live Data**: HYBRID SOLUTION
  - Live Scores: Livescore.com Public API (FREE, no key needed)
  - Odds: The Odds API (500 req/month free tier)
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server

## Deployment Info
- **Server**: Strato V-Server (87.106.8.138)
- **Domain**: betradarmus.de
- **GitHub**: https://github.com/Interpohl/Betradarmus26_1
- **Ports**: Frontend 3005, Backend 8005

---

## Completed Features ✅

### Initial Development
- [x] Full landing page with all sections
- [x] JWT-based user authentication
- [x] Stripe payment integration
- [x] Early Access & Contact forms
- [x] Docker deployment on Strato V-Server
- [x] SSL certificate for betradarmus.de
- [x] SEO files (sitemap.xml, robots.txt)

### March 3, 2025 - Legal Pages
- [x] Impressum, AGB, Datenschutz pages
- [x] Kontakt page with correct company data
- [x] Footer links updated
- [x] All legal pages deployed to production ✅

### March 3, 2025 - Live Data Integration 🎉
- [x] **The Odds API** integrated for odds data
- [x] **Livescore.com Public API** integrated for live scores
- [x] **HYBRID SOLUTION** implemented:
  - Real-time live scores from 85+ leagues
  - Odds from major European bookmakers
  - Auto-refresh every 20 seconds
- [x] **3-Tab Dashboard**: LIVE, BALD (Starting Soon), PREMATCH
- [x] Real live matches visible (Alanyaspor vs Galatasaray, etc.)

---

## API Integration Details

### Hybrid Solution Architecture
```
┌─────────────────────────────────────────────────┐
│              BETRADARMUS Dashboard              │
├─────────────────────────────────────────────────┤
│                                                 │
│  LIVE SCORES          │    ODDS DATA           │
│  (Livescore.com)      │    (The Odds API)      │
│  ──────────────────   │    ──────────────      │
│  • 85+ leagues        │    • 40+ bookmakers    │
│  • Real-time scores   │    • H2H, Spreads,     │
│  • Match status       │      Over/Under        │
│  • FREE (no API key)  │    • 500 req/mo free   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### The Odds API
- **API Key**: `ac1d4e7d89007af7c399d761e537e678`
- **Free Tier**: 500 requests/month

### Livescore.com Public API
- **Endpoint**: `https://prod-public-api.livescore.com/v1/api/app/date/soccer/{date}/-3`
- **No API key required**
- **Coverage**: 85+ leagues, all major competitions

---

## Backlog 📋

### P2 - Medium Priority
- [ ] api.betradarmus.de subdomain SSL certificate
- [ ] Email confirmation for Early Access sign-ups

### P3 - Low Priority
- [ ] User profile management
- [ ] Subscription management UI
- [ ] Historical odds tracking

### Enhancement Ideas
- [ ] More detailed match statistics
- [ ] Push notifications for high-value opportunities
- [ ] Mobile app

---

## Company Details
- **Company**: Interpohl Solutions GmbH i.Gr.
- **Address**: Kontor H72, Hansastr. 72, 44137 Dortmund
- **Contact**: Tobias Pohl
- **Email**: info@betradarmus.de
- **Phone**: 0170-7967959
