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

## What's Been Implemented

### Phase 1 - MVP (December 2025)
- ✅ Landing page with all sections (Hero, Problem, Solution, Technology, Audience, Pricing, Early Access, Disclaimer)
- ✅ Animated Live Dashboard with simulated data
- ✅ Live Ticker marquee with match data
- ✅ Pricing cards (FREE, PRO €19/month, ELITE €39/month)
- ✅ Early Access email signup form with MongoDB storage
- ✅ Legal pages: /impressum, /datenschutz, /kontakt
- ✅ Contact form with validation
- ✅ Dark theme with Neon-Green accents

### Phase 2 - Core Features (December 2025)
- ✅ **JWT User Authentication** (register, login, profile management)
- ✅ **Stripe Subscription Payments** (checkout sessions, webhooks, transaction tracking)
- ✅ **SofaScore API Integration** (live football data via RapidAPI)
- ✅ **Premium Feature Gating** (Free: 5 opportunities, Pro: full access, Elite: AI insights)
- ✅ **Real Live Dashboard** (authenticated users see real SofaScore data)
- ✅ **Auth Modal** (login/register popup)
- ✅ **Payment Success Page** with status polling

### Backend APIs
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| /api/auth/register | POST | No | User registration |
| /api/auth/login | POST | No | User login, returns JWT |
| /api/auth/me | GET | Yes | Get current user profile |
| /api/payments/checkout | POST | Yes | Create Stripe checkout session |
| /api/payments/status/{id} | GET | Yes | Check payment status |
| /api/webhook/stripe | POST | No | Stripe webhook handler |
| /api/analysis/opportunities | GET | Optional | Live market opportunities |
| /api/live/matches | GET | Optional | Live football matches |
| /api/live/leagues | GET | No | Available leagues |
| /api/early-access | POST | No | Early access signup |
| /api/contact | POST | No | Contact form |
| /api/plans | GET | No | Subscription plans |

### Subscription Tiers
| Plan | Price | Features |
|------|-------|----------|
| FREE | €0 | 5 opportunities, 3 leagues, basic analysis |
| PRO | €19/mo | Full access, Risk Score, Confidence, all Top-5 leagues |
| ELITE | €39/mo | Priority updates, historical analysis, Explainable AI, API |

### Technical Stack
- **Frontend**: React 19, TailwindCSS, Shadcn/UI, Recharts
- **Backend**: FastAPI, Motor (MongoDB async), JWT, bcrypt
- **Database**: MongoDB
- **APIs**: SofaScore via RapidAPI, Stripe
- **Fonts**: Barlow Condensed, Manrope, JetBrains Mono

## Prioritized Backlog

### P0 (Critical - Not Yet Implemented)
- None - all critical features complete

### P1 (High Priority - Future Features)
- Email confirmation for registration (Resend API needed)
- Password reset functionality
- Subscription management (cancel, upgrade/downgrade)
- Recurring billing with Stripe subscriptions

### P2 (Medium Priority)
- Admin dashboard for managing users/signups
- Multi-language support (English)
- Notification system for high-EV opportunities
- Historical data analysis view
- Mobile app (React Native)

### P3 (Low Priority)
- Social login (Google OAuth)
- Referral program
- Affiliate tracking
- Advanced analytics dashboard

## Environment Variables
```
# Backend (.env)
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
STRIPE_API_KEY=sk_test_...
SOFASCORE_API_KEY=...
JWT_SECRET_KEY=...

# Frontend (.env)
REACT_APP_BACKEND_URL=https://...
```

## Next Tasks
1. Add Resend email confirmation for user registration
2. Implement password reset flow
3. Add subscription management (Stripe customer portal)
4. Build admin panel for user management
5. Add push notifications for live opportunities
