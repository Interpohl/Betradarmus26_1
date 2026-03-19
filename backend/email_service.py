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
    
    async def send_early_access_confirmation(self, to_email: str, plan_interest: str) -> bool:
        """Send Early Access confirmation email"""
        
        plan_names = {
            "free": "Free",
            "pro": "Pro (19€/Monat)",
            "elite": "Elite (39€/Monat)"
        }
        plan_display = plan_names.get(plan_interest, plan_interest)
        
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


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get the email service singleton"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
