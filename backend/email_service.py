"""
BETRADARMUS Email Service
SendGrid Integration for Email Notifications
"""

import os
import logging
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@betradarmus.de')
SENDER_NAME = os.environ.get('SENDER_NAME', 'BETRADARMUS')


class EmailService:
    """Email service using SendGrid"""
    
    def __init__(self):
        self.api_key = SENDGRID_API_KEY
        self.sender_email = SENDER_EMAIL
        self.sender_name = SENDER_NAME
        self.client = None
        
        if self.api_key:
            self.client = SendGridAPIClient(self.api_key)
            logger.info("SendGrid Email Service initialized")
        else:
            logger.warning("SENDGRID_API_KEY not set - Email Service disabled")
    
    def is_enabled(self) -> bool:
        """Check if email service is enabled"""
        return self.client is not None
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send an email via SendGrid"""
        if not self.is_enabled():
            logger.warning("Email service disabled - skipping email send")
            return False
        
        try:
            message = Mail(
                from_email=Email(self.sender_email, self.sender_name),
                to_emails=To(to_email),
                subject=subject,
                html_content=HtmlContent(html_content)
            )
            
            if plain_content:
                message.add_content(Content("text/plain", plain_content))
            
            response = self.client.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully to {to_email}")
                return True
            else:
                logger.error(f"Email send failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Email send error: {str(e)}")
            return False
    
    async def send_verification_email(self, to_email: str, verification_token: str, plan_interest: str = "free") -> bool:
        """Send email verification link"""
        
        verification_url = f"https://betradarmus.de/verify?token={verification_token}"
        
        plan_names = {
            "free": "Free",
            "pro": "Pro",
            "elite": "Elite"
        }
        plan_display = plan_names.get(plan_interest, plan_interest)
        
        subject = "BETRADARMUS - Bitte bestätige deine E-Mail-Adresse"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .logo-text {{
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #ffffff;
        }}
        .content {{
            background-color: #121212;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
        }}
        h1 {{
            color: #39FF14;
            font-size: 24px;
            margin: 0 0 16px 0;
        }}
        p {{
            color: #a1a1aa;
            line-height: 1.6;
            margin: 0 0 16px 0;
        }}
        .highlight {{
            color: #ffffff;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #39FF14;
            color: #000000;
            padding: 16px 40px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: none;
            font-size: 14px;
            letter-spacing: 1px;
            margin: 24px 0;
        }}
        .plan-info {{
            background-color: #0a0a0a;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            padding: 20px;
        }}
        .footer a {{
            color: #39FF14;
            text-decoration: none;
        }}
        .warning {{
            font-size: 12px;
            color: #666;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo-text">BETRADARMUS</span>
        </div>
        
        <div class="content">
            <h1>Bestätige deine E-Mail-Adresse</h1>
            
            <p>Vielen Dank für dein Interesse an <span class="highlight">BETRADARMUS</span>!</p>
            
            <p>Um deine Registrierung abzuschließen und Zugang zu erhalten, klicke bitte auf den folgenden Button:</p>
            
            <center>
                <a href="{verification_url}" class="cta-button">E-Mail bestätigen</a>
            </center>
            
            <div class="plan-info">
                <p style="margin: 0; color: #666;">Dein gewählter Plan:</p>
                <p style="margin: 8px 0 0 0; color: #39FF14; font-weight: bold; font-size: 18px;">{plan_display}</p>
            </div>
            
            <p class="warning">
                Falls du dich nicht bei BETRADARMUS registriert hast, kannst du diese E-Mail ignorieren.
                Der Link ist 24 Stunden gültig.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 BETRADARMUS. Alle Rechte vorbehalten.</p>
            <p>
                <a href="https://betradarmus.de/impressum">Impressum</a> | 
                <a href="https://betradarmus.de/datenschutz">Datenschutz</a>
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        plain_content = f"""
BETRADARMUS - E-Mail-Bestätigung

Vielen Dank für dein Interesse an BETRADARMUS!

Um deine Registrierung abzuschließen, klicke bitte auf folgenden Link:
{verification_url}

Dein gewählter Plan: {plan_display}

Falls du dich nicht registriert hast, ignoriere diese E-Mail.
Der Link ist 24 Stunden gültig.

---
BETRADARMUS
https://betradarmus.de
"""
        
        return await self.send_email(to_email, subject, html_content, plain_content)
    
    async def send_welcome_email(self, to_email: str, user_name: str, subscription: str = "free") -> bool:
        """Send welcome email after registration with Telegram group invite"""
        
        # Telegram Group Links based on subscription
        telegram_links = {
            "free": {
                "name": "FREE Community",
                "link": os.environ.get("TELEGRAM_FREE_CHANNEL_LINK", "https://t.me/+Pb8X_nXzKu41N2Yy"),
                "color": "#39FF14"
            },
            "pro": {
                "name": "PRO Signals",
                "link": os.environ.get("TELEGRAM_PRO_CHANNEL_LINK", "https://t.me/+Pb8X_nXzKu41N2Yy"),
                "color": "#39FF14"
            },
            "elite": {
                "name": "ELITE VIP",
                "link": os.environ.get("TELEGRAM_ELITE_CHANNEL", "https://t.me/+SODfqorGIt8khC_9"),
                "color": "#00C2FF"
            }
        }
        
        group_info = telegram_links.get(subscription, telegram_links["free"])
        display_name = user_name if user_name else "Sportwetter"
        
        subject = f"Willkommen bei BETRADARMUS, {display_name}! 🎯"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .logo-text {{
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #ffffff;
        }}
        .content {{
            background-color: #121212;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
        }}
        h1 {{
            color: #39FF14;
            font-size: 26px;
            margin: 0 0 20px 0;
        }}
        p {{
            color: #a1a1aa;
            line-height: 1.7;
            margin: 0 0 16px 0;
            font-size: 15px;
        }}
        .highlight {{
            color: #ffffff;
            font-weight: 600;
        }}
        .telegram-box {{
            background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
            border: 2px solid {group_info['color']};
            border-radius: 12px;
            padding: 28px;
            margin: 28px 0;
            text-align: center;
        }}
        .telegram-icon {{
            font-size: 48px;
            margin-bottom: 16px;
        }}
        .telegram-title {{
            color: {group_info['color']};
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }}
        .telegram-subtitle {{
            color: #a1a1aa;
            font-size: 14px;
            margin: 0 0 20px 0;
        }}
        .cta-button {{
            display: inline-block;
            background-color: {group_info['color']};
            color: #000000;
            padding: 16px 40px;
            border-radius: 8px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: none;
            font-size: 14px;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        }}
        .benefits {{
            background-color: #0a0a0a;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }}
        .benefit {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #1a1a1a;
        }}
        .benefit:last-child {{
            border-bottom: none;
        }}
        .check {{
            color: #39FF14;
            font-size: 16px;
            font-weight: bold;
        }}
        .benefit-text {{
            color: #ededed;
            font-size: 14px;
        }}
        .stats-row {{
            display: flex;
            justify-content: space-around;
            margin: 24px 0;
            padding: 20px;
            background-color: #0a0a0a;
            border-radius: 8px;
        }}
        .stat {{
            text-align: center;
        }}
        .stat-value {{
            color: #39FF14;
            font-size: 28px;
            font-weight: bold;
        }}
        .stat-label {{
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            padding: 20px;
        }}
        .footer a {{
            color: #39FF14;
            text-decoration: none;
        }}
        .warning {{
            background-color: #1a1a0a;
            border-left: 3px solid #f59e0b;
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 13px;
            color: #a1a1aa;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo-text">BETRADARMUS</span>
        </div>
        
        <div class="content">
            <h1>Willkommen, {display_name}! 🎯</h1>
            
            <p>Deine Registrierung bei <span class="highlight">BETRADARMUS</span> war erfolgreich!</p>
            
            <p>Du bist jetzt Teil einer Community von Sportwettern, die auf <span class="highlight">datenbasierte KI-Analysen</span> statt Bauchgefühl setzen.</p>
            
            <div class="telegram-box">
                <div class="telegram-icon">📱</div>
                <p class="telegram-title">Tritt jetzt unserer {group_info['name']} Telegram-Gruppe bei!</p>
                <p class="telegram-subtitle">Erhalte Live-Signale direkt auf dein Handy</p>
                <a href="{group_info['link']}" class="cta-button">Telegram Gruppe beitreten</a>
            </div>
            
            <div class="benefits">
                <div class="benefit">
                    <span class="check">✓</span>
                    <span class="benefit-text">Live-Signale mit Confidence Score</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span class="benefit-text">KI-basierte Spielanalysen</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span class="benefit-text">Echtzeit-Benachrichtigungen</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span class="benefit-text">Community-Support</span>
                </div>
            </div>
            
            <div class="stats-row">
                <div class="stat">
                    <div class="stat-value">71%</div>
                    <div class="stat-label">Trefferquote</div>
                </div>
                <div class="stat">
                    <div class="stat-value">2.847</div>
                    <div class="stat-label">Signale</div>
                </div>
                <div class="stat">
                    <div class="stat-value">24/7</div>
                    <div class="stat-label">Live-Analyse</div>
                </div>
            </div>
            
            <div class="warning">
                ⚠️ <strong>Wichtig:</strong> Setze nie mehr als 10% deiner Bankroll auf einen einzelnen Tipp. Sportwetten sind Unterhaltung, kein Einkommen.
            </div>
            
            <p style="text-align: center; margin-top: 24px;">
                <a href="https://betradarmus.de" style="color: #39FF14; text-decoration: none; font-weight: bold;">→ Zur BETRADARMUS Plattform</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 BETRADARMUS. Alle Rechte vorbehalten.</p>
            <p>
                <a href="https://betradarmus.de/impressum">Impressum</a> | 
                <a href="https://betradarmus.de/datenschutz">Datenschutz</a>
            </p>
            <p style="margin-top: 12px; color: #444;">
                Du erhältst diese E-Mail, weil du dich bei BETRADARMUS registriert hast.
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        plain_content = f"""
BETRADARMUS - Willkommen, {display_name}!

Deine Registrierung bei BETRADARMUS war erfolgreich!

Du bist jetzt Teil einer Community von Sportwettern, die auf datenbasierte KI-Analysen statt Bauchgefühl setzen.

🔔 TRITT JETZT UNSERER TELEGRAM-GRUPPE BEI:
{group_info['link']}

Was dich erwartet:
✓ Live-Signale mit Confidence Score
✓ KI-basierte Spielanalysen
✓ Echtzeit-Benachrichtigungen
✓ Community-Support

Unsere Statistiken:
- 71% Trefferquote
- 2.847+ Signale
- 24/7 Live-Analyse

⚠️ Wichtig: Setze nie mehr als 10% deiner Bankroll auf einen einzelnen Tipp.

→ Zur Plattform: https://betradarmus.de

---
BETRADARMUS
https://betradarmus.de
"""
        
        return await self.send_email(to_email, subject, html_content, plain_content)
        """Send Early Access confirmation email"""
        
        plan_names = {
            "free": "Free",
            "pro": "Pro (19€/Monat)",
            "elite": "Elite (39€/Monat)"
        }
        plan_display = plan_names.get(plan_interest, plan_interest)
        
        # FREE Community Group Link
        free_group_link = "https://t.me/+Pb8X_nXzKu41N2Yy"
        free_group_section = ""
        if plan_interest == "free":
            free_group_section = f"""
            <div style="background-color: #0a0a0a; border: 1px solid #39FF14; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
                <p style="color: #39FF14; font-weight: bold; margin: 0 0 12px 0;">👥 Tritt unserer FREE Community bei!</p>
                <p style="color: #a1a1aa; margin: 0 0 16px 0; font-size: 14px;">Tausche dich mit anderen FREE-Nutzern aus und erhalte exklusive Tipps.</p>
                <a href="{free_group_link}" style="display: inline-block; background-color: #39FF14; color: #000000; padding: 12px 24px; border-radius: 4px; font-weight: bold; text-decoration: none; font-size: 14px;">Telegram Gruppe beitreten</a>
            </div>
            """
        
        subject = "Willkommen bei BETRADARMUS - Early Access bestätigt!"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .logo {{
            display: inline-flex;
            align-items: center;
            gap: 12px;
        }}
        .logo-icon {{
            width: 40px;
            height: 40px;
            background-color: #39FF14;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }}
        .logo-text {{
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .content {{
            background-color: #121212;
            border: 1px solid #222;
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
        }}
        h1 {{
            color: #39FF14;
            font-size: 28px;
            margin: 0 0 16px 0;
        }}
        p {{
            color: #a1a1aa;
            line-height: 1.6;
            margin: 0 0 16px 0;
        }}
        .highlight {{
            color: #ffffff;
        }}
        .plan-badge {{
            display: inline-block;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
            margin: 16px 0;
        }}
        .features {{
            background-color: #0a0a0a;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }}
        .feature {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #222;
        }}
        .feature:last-child {{
            border-bottom: none;
        }}
        .check {{
            color: #39FF14;
            font-size: 18px;
        }}
        .cta-button {{
            display: inline-block;
            background-color: #39FF14;
            color: #000000;
            padding: 14px 32px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: none;
            font-size: 14px;
            letter-spacing: 1px;
            margin: 24px 0;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            padding: 20px;
        }}
        .footer a {{
            color: #39FF14;
            text-decoration: none;
        }}
        .social {{
            margin: 20px 0;
        }}
        .social a {{
            color: #a1a1aa;
            text-decoration: none;
            margin: 0 10px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <span class="logo-text">BETRADARMUS</span>
            </div>
        </div>
        
        <div class="content">
            <h1>Early Access bestätigt!</h1>
            
            <p>Vielen Dank für Ihr Interesse an <span class="highlight">BETRADARMUS</span> - der KI-gestützten Live-Fußball-Analyseplattform.</p>
            
            <p>Du hast dich für folgenden Plan interessiert:</p>
            
            <div class="plan-badge">{plan_display}</div>
            
            <div class="features">
                <div class="feature">
                    <span class="check">✓</span>
                    <span>Live-Marktanalyse in Echtzeit</span>
                </div>
                <div class="feature">
                    <span class="check">✓</span>
                    <span>KI-gestützte Wahrscheinlichkeitsberechnung</span>
                </div>
                <div class="feature">
                    <span class="check">✓</span>
                    <span>Telegram Signal-Benachrichtigungen</span>
                </div>
                <div class="feature">
                    <span class="check">✓</span>
                    <span>Markt-Ineffizienzen erkennen</span>
                </div>
            </div>
            
            {free_group_section}
            
            <p>Wir werden dich benachrichtigen, sobald der volle Zugang verfügbar ist. Bis dahin kannst du unseren Telegram-Bot testen:</p>
            
            <center>
                <a href="https://t.me/Betradarmus_bot" class="cta-button">Telegram Bot starten</a>
            </center>
            
            <p style="font-size: 14px; color: #666; margin-top: 24px;">
                Bei Fragen erreichst du uns unter <a href="mailto:info@betradarmus.de" style="color: #39FF14;">info@betradarmus.de</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 BETRADARMUS. Alle Rechte vorbehalten.</p>
            <p>
                <a href="https://betradarmus.de/impressum">Impressum</a> | 
                <a href="https://betradarmus.de/datenschutz">Datenschutz</a> | 
                <a href="https://betradarmus.de/agb">AGB</a>
            </p>
            <p style="margin-top: 16px; color: #444;">
                Du erhältst diese E-Mail, weil du dich für den Early Access bei BETRADARMUS angemeldet hast.
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        plain_content = f"""
BETRADARMUS - Early Access bestätigt!

Vielen Dank für Ihr Interesse an BETRADARMUS - der KI-gestützten Live-Fußball-Analyseplattform.

Du hast dich für folgenden Plan interessiert: {plan_display}

Was dich erwartet:
- Live-Marktanalyse in Echtzeit
- KI-gestützte Wahrscheinlichkeitsberechnung
- Telegram Signal-Benachrichtigungen
- Markt-Ineffizienzen erkennen

Wir werden dich benachrichtigen, sobald der volle Zugang verfügbar ist.

Telegram Bot: https://t.me/Betradarmus_bot

Bei Fragen: info@betradarmus.de

---
BETRADARMUS
https://betradarmus.de
"""
        
        return await self.send_email(to_email, subject, html_content, plain_content)
    
    async def send_upgrade_email(self, to_email: str, user_name: str, new_plan: str) -> bool:
        """Send upgrade confirmation email with exclusive Telegram group invite"""
        
        # Plan configurations
        plan_configs = {
            "pro": {
                "name": "PRO",
                "price": "49€/Monat",
                "color": "#39FF14",
                "telegram_link": os.environ.get("TELEGRAM_PRO_CHANNEL_LINK", "https://t.me/+HL_1d7-rXh41Y1i"),
                "features": [
                    "Voller Live-Zugriff auf alle Signale",
                    "Risk Score Analyse für jedes Signal",
                    "Confidence Index mit KI-Bewertung",
                    "Erweiterte Liga-Filter (20+ Ligen)",
                    "E-Mail Support innerhalb 24h",
                    "Exklusive PRO Telegram-Gruppe"
                ],
                "emoji": "⚡"
            },
            "elite": {
                "name": "ELITE",
                "price": "199€/Monat",
                "color": "#00C2FF",
                "telegram_link": os.environ.get("TELEGRAM_ELITE_CHANNEL", "https://t.me/+SODfqorGIt8khC_9"),
                "features": [
                    "Priorisierte Live-Updates (vor allen anderen)",
                    "Historische Analyse & Backtesting",
                    "Erweiterte Insights & Value-Alerts",
                    "Alle Ligen weltweit (50+)",
                    "API-Zugang für eigene Analysen",
                    "Priority Support (Antwort in 2h)",
                    "Explainable AI Details",
                    "Exklusive ELITE VIP Telegram-Gruppe"
                ],
                "emoji": "👑"
            }
        }
        
        config = plan_configs.get(new_plan, plan_configs["pro"])
        display_name = user_name if user_name else "Champion"
        
        subject = f"{config['emoji']} Willkommen im {config['name']} Club, {display_name}!"
        
        # Build features HTML
        features_html = ""
        for feature in config["features"]:
            features_html += f"""
                <div class="feature">
                    <span class="check">✓</span>
                    <span class="feature-text">{feature}</span>
                </div>
            """
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            margin: 0;
            padding: 0;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 40px;
        }}
        .logo-text {{
            font-size: 28px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #ffffff;
        }}
        .content {{
            background-color: #121212;
            border: 2px solid {config['color']};
            border-radius: 12px;
            padding: 32px;
            margin-bottom: 24px;
        }}
        .badge {{
            display: inline-block;
            background: {config['color']};
            color: #000000;
            padding: 8px 24px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 2px;
            margin-bottom: 20px;
        }}
        h1 {{
            color: {config['color']};
            font-size: 28px;
            margin: 0 0 20px 0;
        }}
        p {{
            color: #a1a1aa;
            line-height: 1.7;
            margin: 0 0 16px 0;
            font-size: 15px;
        }}
        .highlight {{
            color: #ffffff;
            font-weight: 600;
        }}
        .telegram-box {{
            background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
            border: 2px solid {config['color']};
            border-radius: 12px;
            padding: 28px;
            margin: 28px 0;
            text-align: center;
        }}
        .telegram-icon {{
            font-size: 56px;
            margin-bottom: 16px;
        }}
        .telegram-title {{
            color: {config['color']};
            font-size: 22px;
            font-weight: bold;
            margin: 0 0 8px 0;
        }}
        .telegram-subtitle {{
            color: #a1a1aa;
            font-size: 14px;
            margin: 0 0 20px 0;
        }}
        .telegram-exclusive {{
            background: {config['color']}22;
            border: 1px dashed {config['color']};
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
        }}
        .telegram-exclusive-text {{
            color: {config['color']};
            font-size: 13px;
            font-weight: 600;
            margin: 0;
        }}
        .cta-button {{
            display: inline-block;
            background-color: {config['color']};
            color: #000000;
            padding: 18px 48px;
            border-radius: 8px;
            font-weight: bold;
            text-transform: uppercase;
            text-decoration: none;
            font-size: 16px;
            letter-spacing: 1px;
        }}
        .features {{
            background-color: #0a0a0a;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }}
        .features-title {{
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 16px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .feature {{
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #1a1a1a;
        }}
        .feature:last-child {{
            border-bottom: none;
        }}
        .check {{
            color: {config['color']};
            font-size: 16px;
            font-weight: bold;
        }}
        .feature-text {{
            color: #ededed;
            font-size: 14px;
        }}
        .price-box {{
            text-align: center;
            padding: 20px;
            background: #0a0a0a;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .price {{
            color: {config['color']};
            font-size: 36px;
            font-weight: bold;
        }}
        .price-label {{
            color: #666;
            font-size: 14px;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 12px;
            padding: 20px;
        }}
        .footer a {{
            color: {config['color']};
            text-decoration: none;
        }}
        .support-box {{
            background: #0f0f1a;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
        }}
        .support-text {{
            color: #a1a1aa;
            font-size: 13px;
            margin: 0;
        }}
        .support-email {{
            color: {config['color']};
            text-decoration: none;
            font-weight: 600;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo-text">BETRADARMUS</span>
        </div>
        
        <div class="content">
            <center>
                <div class="badge">{config['emoji']} {config['name']} MEMBER</div>
            </center>
            
            <h1>Willkommen im {config['name']} Club!</h1>
            
            <p>Herzlichen Glückwunsch, <span class="highlight">{display_name}</span>!</p>
            
            <p>Dein Upgrade auf <span class="highlight">{config['name']}</span> war erfolgreich. Du gehörst jetzt zu den Top-Analysten, die auf maximale Performance setzen.</p>
            
            <div class="telegram-box">
                <div class="telegram-icon">{config['emoji']}📱</div>
                <p class="telegram-title">Deine exklusive {config['name']} Telegram-Gruppe</p>
                <p class="telegram-subtitle">Hier erhältst du priorisierte Signale und VIP-Support</p>
                <div class="telegram-exclusive">
                    <p class="telegram-exclusive-text">🔒 Nur für {config['name']}-Mitglieder zugänglich</p>
                </div>
                <a href="{config['telegram_link']}" class="cta-button">Jetzt beitreten</a>
            </div>
            
            <div class="features">
                <p class="features-title">Deine {config['name']} Vorteile:</p>
                {features_html}
            </div>
            
            <div class="price-box">
                <div class="price">{config['price']}</div>
                <div class="price-label">Dein aktueller Plan</div>
            </div>
            
            <div class="support-box">
                <p class="support-text">
                    Fragen? Als {config['name']}-Mitglied hast du Priority Support:<br>
                    <a href="mailto:info@betradarmus.de" class="support-email">info@betradarmus.de</a>
                </p>
            </div>
            
            <p style="text-align: center; margin-top: 24px;">
                <a href="https://betradarmus.de" style="color: {config['color']}; text-decoration: none; font-weight: bold;">→ Zur BETRADARMUS Plattform</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© 2025 BETRADARMUS. Alle Rechte vorbehalten.</p>
            <p>
                <a href="https://betradarmus.de/impressum">Impressum</a> | 
                <a href="https://betradarmus.de/datenschutz">Datenschutz</a>
            </p>
        </div>
    </div>
</body>
</html>
"""
        
        # Build features text
        features_text = "\n".join([f"✓ {f}" for f in config["features"]])
        
        plain_content = f"""
BETRADARMUS - Willkommen im {config['name']} Club!

Herzlichen Glückwunsch, {display_name}!

Dein Upgrade auf {config['name']} war erfolgreich. Du gehörst jetzt zu den Top-Analysten, die auf maximale Performance setzen.

🔔 DEINE EXKLUSIVE {config['name'].upper()} TELEGRAM-GRUPPE:
{config['telegram_link']}

Nur für {config['name']}-Mitglieder zugänglich!

Deine {config['name']} Vorteile:
{features_text}

Dein Plan: {config['price']}

Priority Support: info@betradarmus.de

→ Zur Plattform: https://betradarmus.de

---
BETRADARMUS
https://betradarmus.de
"""
        
        return await self.send_email(to_email, subject, html_content, plain_content)


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get the email service singleton"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
