# BETRADARMUS - Product Requirements Document

## Original Problem Statement
Modern, high-quality, trustworthy SaaS website for AI startup "BETRADARMUS" - Live football intelligently analyzed. AI-powered live sports analysis platform for football markets.

## Target Audience
- Ambitious sports analysts
- Data-savvy football fans
- Semi-professional market observers
- Tech-savvy users

## Design
- Dark premium theme (anthracite/black) with neon-green accent
- Tech/fintech aesthetic ("Bloomberg meets Football Analytics")

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT
- **Payments**: Stripe (test mode)
- **Live Data**: The Odds API (500 requests/month free tier)
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server

## Deployment Info
- **Server**: Strato V-Server (87.106.8.138)
- **Domain**: betradarmus.de
- **GitHub**: https://github.com/Interpohl/Betradarmus26_1
- **Ports**: Frontend 3005, Backend 8005

---

## Completed Features ✅

### Initial Development (Dec 2024 - Feb 2025)
- [x] Full landing page with all sections (Hero, Problem, Solution, Technology, Pricing, Footer)
- [x] JWT-based user authentication (register/login)
- [x] Stripe payment integration (PRO/ELITE plans)
- [x] Early Access email capture form
- [x] Contact form (saves to MongoDB)
- [x] Docker deployment on Strato V-Server
- [x] SSL certificate for betradarmus.de
- [x] SEO files (sitemap.xml, robots.txt)
- [x] Social media graphics created

### March 3, 2025 - Legal Pages
- [x] **Impressum page** - /impressum with full company details
- [x] **AGB page** - /agb (Terms & Conditions)
- [x] **Datenschutz page** - /datenschutz (Privacy Policy)
- [x] **Footer updated** - Added AGB link
- [x] **Kontakt page updated** - Correct company address, email, phone
- [x] All legal pages deployed to production ✅

### March 3, 2025 - Live Data Integration 🎉
- [x] **The Odds API integrated** - Real live football odds from 40+ bookmakers
- [x] **New API endpoints**:
  - `GET /api/odds/sports` - All available sports/leagues
  - `GET /api/odds/live` - Live odds for any sport
  - `GET /api/odds/event/{event_id}` - Detailed event odds (Premium)
- [x] **Updated `/api/analysis/opportunities`** - Now uses real odds data
- [x] **Frontend updated** - LiveDashboard shows real Bundesliga data
- [x] **Premium features** - All markets, implied probabilities, market margins
- [x] **Elite features** - Explainable AI with recommendations

---

## API Integration Details

### The Odds API
- **API Key**: `ac1d4e7d89007af7c399d761e537e678`
- **Free Tier**: 500 requests/month
- **Coverage**: Bundesliga, Premier League, La Liga, Serie A, Champions League, etc.
- **Markets**: Head-to-Head (h2h), Spreads, Totals (Over/Under)
- **Regions**: EU, UK, US, AU

### Available Leagues (Soccer)
- `soccer_germany_bundesliga` - Bundesliga
- `soccer_germany_bundesliga2` - 2. Bundesliga  
- `soccer_epl` - English Premier League
- `soccer_spain_la_liga` - La Liga
- `soccer_italy_serie_a` - Serie A
- `soccer_france_ligue_one` - Ligue 1
- `soccer_uefa_champs_league` - Champions League
- `soccer_uefa_europa_league` - Europa League
- And 40+ more...

---

## Pending Deployment 🚀

The Odds API integration is complete in the Emergent preview environment. 
To deploy to production:

1. Push to GitHub (use "Save to Github" button)
2. SSH into server: `ssh root@87.106.8.138`
3. Deploy: `cd /var/www/betradarmus && git pull && docker-compose up -d --build`

**Important**: Add the API key to the server's `.env`:
```
ODDS_API_KEY=ac1d4e7d89007af7c399d761e537e678
```

---

## Future Tasks 📋

### P2 - Medium Priority
- [ ] api.betradarmus.de subdomain SSL certificate
- [ ] Email confirmation for Early Access sign-ups
- [ ] Google Search Console setup (after account reinstatement)

### P3 - Low Priority
- [ ] Additional dashboard features for authenticated users
- [ ] User profile management
- [ ] Subscription management UI
- [ ] Historical odds data analysis

### Enhancement Ideas
- [ ] More leagues beyond Bundesliga by default
- [ ] Odds movement tracking
- [ ] Alerts for high-value opportunities
- [ ] Mobile app

---

## Company Details
- **Company**: Interpohl Solutions GmbH i.Gr.
- **Address**: Kontor H72, Hansastr. 72, 44137 Dortmund
- **Contact**: Tobias Pohl
- **Email**: info@betradarmus.de
- **Phone**: 0170-7967959

---

## Credentials Reference
- **Strato SSH**: `ssh root@87.106.8.138`
- **GitHub**: https://github.com/Interpohl/Betradarmus26_1
- **Stripe Test Key**: `sk_test_emergent`
- **Odds API Key**: `ac1d4e7d89007af7c399d761e537e678`
