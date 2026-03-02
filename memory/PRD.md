# BETRADARMUS - Product Requirements Document

## Original Problem Statement
Build a modern, high-quality, trustworthy SaaS website for BETRADARMUS - an AI-powered live football/soccer analysis platform. The platform analyzes live markets, probabilities, and market inefficiencies in real-time. NOT a betting provider - provides data-based market analysis and risk assessments.

## User Personas
1. **Data-Driven Fans** - Football fans seeking data-based insights and analytical understanding of games
2. **Market Analysts** - Professional analysts systematically evaluating market movements and probabilities  
3. **Performance Users** - Ambitious users requiring maximum speed and precise risk assessments

## Core Requirements
- Dark premium theme (Anthracite/Black) with Neon-Green (#39FF14) accent
- German language website
- Animated live dashboard mockup with simulated data
- Real email capture for Early Access (MongoDB storage)
- Separate legal pages (Impressum, Datenschutz, Kontakt)
- Professional, analytical tone - NO gambling marketing

## What's Been Implemented (December 2025)

### Frontend
- ✅ Landing page with all sections (Hero, Problem, Solution, Technology, Audience, Pricing, Early Access, Disclaimer)
- ✅ Animated Live Dashboard with real-time opportunity updates (3-second intervals)
- ✅ Live Ticker marquee with match data
- ✅ Pricing cards (FREE, PRO €19/month, ELITE €39/month) with animated Elite border
- ✅ Early Access email signup form
- ✅ Responsive navigation with mobile menu
- ✅ Legal pages: /impressum, /datenschutz, /kontakt
- ✅ Contact form with validation
- ✅ Footer with navigation and social links
- ✅ Dark theme with Neon-Green accents throughout
- ✅ Typography: Barlow Condensed (headings), Manrope (body), JetBrains Mono (data)

### Backend
- ✅ FastAPI server with /api prefix
- ✅ POST /api/early-access - Email signup with duplicate check
- ✅ GET /api/early-access/count - Signup count
- ✅ POST /api/contact - Contact form submission
- ✅ MongoDB integration for data persistence

### Design
- ✅ "Bloomberg meets Football Analytics" aesthetic
- ✅ Grid overlay backgrounds
- ✅ Glassmorphism effects
- ✅ Micro-animations (fade-in, pulse, hover states)
- ✅ Mobile-first responsive design

## Prioritized Backlog

### P0 (Critical - Not Yet Implemented)
- None - MVP complete

### P1 (High Priority - Future Features)
- User authentication system
- Actual live data integration
- Dashboard with real market data
- Payment integration (Stripe) for subscriptions
- Email confirmation for Early Access signups

### P2 (Medium Priority)
- Admin dashboard for managing signups
- Multi-language support (English)
- Newsletter integration
- Analytics/tracking implementation
- Performance optimization

## Next Tasks
1. Implement Stripe payment integration for PRO/ELITE subscriptions
2. Build user authentication (JWT or OAuth)
3. Connect to real live football data APIs
4. Add email verification for Early Access
5. Create admin panel for managing subscribers
