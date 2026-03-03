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
- **Deployment**: Docker, Docker Compose, Nginx on Strato V-Server

## Deployment Info
- **Server**: Strato V-Server (87.106.8.138)
- **Domain**: betradarmus.de
- **GitHub**: https://github.com/Interpohl/Betradarmus26_1
- **Ports**: Frontend 3005, Backend 8005

---

## Completed Features ✅

### December 2024 - March 2025
- [x] Full landing page with all sections (Hero, Problem, Solution, Technology, Pricing, Footer)
- [x] JWT-based user authentication (register/login)
- [x] Stripe payment integration (PRO/ELITE plans)
- [x] Early Access email capture form
- [x] Contact form (saves to MongoDB)
- [x] Docker deployment on Strato V-Server
- [x] SSL certificate for betradarmus.de
- [x] SEO files (sitemap.xml, robots.txt)
- [x] Social media graphics created

### March 3, 2025
- [x] **Impressum page** - /impressum with full company details
- [x] **AGB page** - /agb (Terms & Conditions)
- [x] **Datenschutz page** - /datenschutz (Privacy Policy)
- [x] **Footer updated** - Added AGB link
- [x] **Kontakt page updated** - Correct company address, email, phone from Impressum
- [x] All legal pages deployed to production

---

## In Progress / Blocked 🟡

### Live Data Integration (P1) - BLOCKED
- **Status**: Waiting for user to subscribe to API-Football on RapidAPI
- **Issue**: Simulated data currently in use
- **Next Steps**: 
  1. User subscribes to https://rapidapi.com/api-sports/api/api-football
  2. Implement real API calls in /api/analysis/opportunities endpoint

### api.betradarmus.de Subdomain (P2)
- **Status**: DNS configured, awaiting SSL certificate
- **Next Steps**: Run certbot after DNS propagation

---

## Backlog / Future Tasks 📋

### P2 - Medium Priority
- [ ] Email confirmation for Early Access sign-ups (needs email service like Resend)
- [ ] Google Search Console setup (blocked - user's Google account suspended)

### P3 - Low Priority
- [ ] Additional dashboard features for authenticated users
- [ ] User profile management
- [ ] Subscription management UI

---

## Known Issues ⚠️

1. **Docker ContainerConfig Error**: Occasionally occurs during deployment. Fix: `docker-compose down`, remove images, rebuild.
2. **Live Data**: Currently using simulated/mock data. Core feature pending API subscription.

---

## Company Details (for reference)
- **Company**: Interpohl Solutions GmbH i.Gr.
- **Address**: Kontor H72, Hansastr. 72, 44137 Dortmund
- **Contact**: Tobias Pohl
- **Email**: info@betradarmus.de
- **Phone**: 0170-7967959
