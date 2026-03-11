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
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server

## Current Architecture
```
/app
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies (stripe, httpx, etc.)
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile         # Uses node:20-alpine
├── docker-compose.yml     # Backend on port 8005, Frontend on port 3000
└── .github/workflows/deploy-strato.yml
```

## Server Configuration (Strato V-Server: 87.106.8.138)
- **Frontend**: Port 3000 → nginx → betradarmus.de
- **Backend**: Port 8005 → nginx → api.betradarmus.de
- **MongoDB**: Internal Docker network

## Key API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/payments/checkout` - Create Stripe checkout
- `GET /api/analysis/opportunities` - Live market opportunities (hybrid data)
- `GET /api/livescore/live` - Live scores from Livescore.com
- `GET /api/odds/live` - Odds from The Odds API
- `POST /api/early-access` - Early access signup
- `POST /api/contact` - Contact form

## Database Schema
- **users**: `{id, email, password_hash, name, subscription, created_at}`
- **early_access**: `{id, email, plan_interest, timestamp}`
- **contact_messages**: `{id, name, email, subject, message, timestamp}`
- **payment_transactions**: `{id, user_id, session_id, plan, amount, payment_status}`

## 3rd Party Integrations
- **Stripe**: Payment processing (official Python SDK)
- **The Odds API**: Prematch odds (Key: ac1d4e7d89007af7c399d761e537e678)
- **Livescore.com**: Public API for live scores (no key required)

---

## Completed Features ✅

### 2025-03-11 - Production Deployment Fix
- Fixed port conflict: Backend now runs on port 8005 (was 8001, conflicted with firmbay.de)
- Fixed nginx syntax error (stray "0" character)
- Removed `emergentintegrations` dependency completely
- Rewrote Stripe integration to use official `stripe` Python package
- Website is now live at https://betradarmus.de

### Previous Completions
- Full landing page with Hero, Problem, Solution, Technology, Pricing sections
- Legal pages: Impressum, AGB, Datenschutz
- Contact page with company details
- User authentication (JWT)
- Stripe payment integration
- Live data integration (hybrid: Livescore.com + The Odds API)
- Dashboard with LIVE, STARTING SOON, and PREMATCH tabs
- Early Access email capture form

---

## Pending Issues

### P1 - CI/CD Pipeline
- GitHub Actions workflow is broken
- Missing secrets: `STRATO_HOST`, `STRATO_USER`, `STRATO_SSH_KEY`
- User needs to add SSH key and secrets to GitHub repository

### P2 - API Subdomain SSL
- `api.betradarmus.de` needs SSL certificate setup
- Currently backend is accessible but may not have HTTPS

### P3 - Google Search Console
- Blocked due to user's Google account suspension
- Resume when account is reinstated

---

## Future Tasks / Backlog

### P2
- Email confirmation for Early Access sign-ups
- Complete SSL setup for api.betradarmus.de

### P3
- Google Search Console verification
- SEO optimization
- Performance monitoring setup

---

## Credentials
- **Server SSH**: `ssh root@87.106.8.138`
- **GitHub Repo**: `https://github.com/Interpohl/Betradarmus26_1`
- **The Odds API Key**: `ac1d4e7d89007af7c399d761e537e678`
