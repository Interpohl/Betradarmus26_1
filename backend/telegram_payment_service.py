"""
BETRADARMUS Telegram Payment Service
Handle payments directly within Telegram Bot
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, List
from telegram import (
    Update, 
    LabeledPrice, 
    InlineKeyboardButton, 
    InlineKeyboardMarkup,
    ShippingOption
)
from telegram.ext import ContextTypes
from telegram.constants import ParseMode

logger = logging.getLogger(__name__)

# Telegram Payment Provider Token
# For testing: Use "PROVIDER_TOKEN" placeholder - will need real token from BotFather
TELEGRAM_PAYMENT_PROVIDER_TOKEN = os.environ.get("TELEGRAM_PAYMENT_PROVIDER_TOKEN", "")

# Subscription prices in cents (Telegram uses smallest currency unit)
TELEGRAM_PRICES = {
    "pro_monthly": {
        "title": "PRO Monatlich",
        "description": "Voller Zugriff auf Live-Signale, Execution Score, Confidence, Risk Score, Echtzeit Telegram Alerts",
        "amount": 2900,  # €29.00
        "currency": "EUR",
        "plan": "pro",
        "interval": "monthly"
    },
    "pro_yearly": {
        "title": "PRO Jährlich",
        "description": "PRO Plan für 12 Monate - Spare 28%!",
        "amount": 24900,  # €249.00
        "currency": "EUR",
        "plan": "pro",
        "interval": "yearly"
    },
    "elite_monthly": {
        "title": "ELITE Monatlich", 
        "description": "Alles aus PRO + Signal Lifetime Prediction, Erweiterte Explain Layer, Personalisierte Filter, Signal-Historie",
        "amount": 7900,  # €79.00
        "currency": "EUR",
        "plan": "elite",
        "interval": "monthly"
    },
    "elite_yearly": {
        "title": "ELITE Jährlich",
        "description": "ELITE Plan für 12 Monate - Spare 26%!",
        "amount": 69900,  # €699.00
        "currency": "EUR",
        "plan": "elite",
        "interval": "yearly"
    }
}


class TelegramPaymentService:
    """Handle Telegram native payments for BETRADARMUS"""
    
    def __init__(self, db, subscription_service):
        self.db = db
        self.subscription_service = subscription_service
        self.provider_token = TELEGRAM_PAYMENT_PROVIDER_TOKEN
        
    def is_payment_enabled(self) -> bool:
        """Check if Telegram payments are configured"""
        return bool(self.provider_token and self.provider_token != "")
    
    async def show_plans_menu(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show available subscription plans"""
        
        telegram_id = str(update.effective_user.id)
        
        # Get current subscription
        telegram_user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        current_plan = telegram_user.get("subscription_level", "free") if telegram_user else "free"
        
        message = f"""
🎯 *BETRADARMUS Pläne*

Dein aktueller Plan: *{current_plan.upper()}*

━━━━━━━━━━━━━━━━━━━━━

⭐ *FREE* - Kostenlos
• Max. 5 Signale pro Tag
• Verzögerte Signale (15 Min.)
• 2 Ligen
• Basis-Telegram Alerts

━━━━━━━━━━━━━━━━━━━━━

⚡ *PRO* - €29/Monat oder €249/Jahr
• Unbegrenzte Signale
• Echtzeit-Signale
• Execution Score
• Confidence Bewertung
• Risk Score
• 5 Ligen
• Echtzeit Telegram Alerts

━━━━━━━━━━━━━━━━━━━━━

👑 *ELITE* - €79/Monat oder €699/Jahr
• Alles aus PRO
• Signal Lifetime Prediction
• Erweiterte Explain Layer
• Personalisierte Signalfilter
• Signal-Historie
• 8 Ligen
• Schnellere Signalerkennung

━━━━━━━━━━━━━━━━━━━━━

Wähle einen Plan zum Upgraden:
"""
        
        keyboard = []
        
        if current_plan == "free":
            keyboard.append([
                InlineKeyboardButton("⚡ PRO freischalten", callback_data="upgrade_pro"),
                InlineKeyboardButton("👑 ELITE freischalten", callback_data="upgrade_elite")
            ])
        elif current_plan == "pro":
            keyboard.append([
                InlineKeyboardButton("👑 Upgrade auf ELITE", callback_data="upgrade_elite")
            ])
        
        keyboard.append([
            InlineKeyboardButton("📊 Mein Status", callback_data="check_status"),
            InlineKeyboardButton("⚙️ Abo verwalten", callback_data="manage_subscription")
        ])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
    
    async def show_upgrade_options(self, update: Update, context: ContextTypes.DEFAULT_TYPE, plan: str):
        """Show payment options for a specific plan"""
        
        query = update.callback_query
        await query.answer()
        
        plan_data = {
            "pro": {
                "name": "PRO",
                "monthly_key": "pro_monthly",
                "yearly_key": "pro_yearly",
                "icon": "⚡"
            },
            "elite": {
                "name": "ELITE", 
                "monthly_key": "elite_monthly",
                "yearly_key": "elite_yearly",
                "icon": "👑"
            }
        }
        
        p = plan_data.get(plan)
        if not p:
            await query.edit_message_text("❌ Ungültiger Plan")
            return
        
        monthly = TELEGRAM_PRICES[p["monthly_key"]]
        yearly = TELEGRAM_PRICES[p["yearly_key"]]
        
        message = f"""
{p['icon']} *{p['name']} Plan*

Wähle dein Zahlungsintervall:

📅 *Monatlich:* €{monthly['amount'] / 100:.2f}/Monat
📅 *Jährlich:* €{yearly['amount'] / 100:.2f}/Jahr _(spare {100 - int((yearly['amount'] / (monthly['amount'] * 12)) * 100)}%!)_

Nach der Zahlung wird dein Account sofort freigeschaltet und du erhältst Zugriff auf alle {p['name']}-Features.
"""
        
        keyboard = [
            [
                InlineKeyboardButton(
                    f"💳 {p['name']} Monatlich (€{monthly['amount'] / 100:.2f})", 
                    callback_data=f"pay_{p['monthly_key']}"
                )
            ],
            [
                InlineKeyboardButton(
                    f"💳 {p['name']} Jährlich (€{yearly['amount'] / 100:.2f})", 
                    callback_data=f"pay_{p['yearly_key']}"
                )
            ],
            [InlineKeyboardButton("🌐 Auf der Website bezahlen", url="https://betradarmus.de/#pricing")],
            [InlineKeyboardButton("◀️ Zurück", callback_data="show_plans")]
        ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
    
    async def send_invoice(self, update: Update, context: ContextTypes.DEFAULT_TYPE, price_key: str):
        """Send a Telegram payment invoice"""
        
        query = update.callback_query
        await query.answer()
        
        if not self.is_payment_enabled():
            # Fallback to website payment if Telegram payments not configured
            await query.edit_message_text(
                "💳 *Zahlung über Website*\n\n"
                "Telegram-Zahlungen sind noch nicht aktiviert.\n"
                "Bitte nutze unsere Website für die Zahlung:\n\n"
                "👉 [Jetzt auf betradarmus.de upgraden](https://betradarmus.de/#pricing)",
                parse_mode=ParseMode.MARKDOWN,
                disable_web_page_preview=True
            )
            return
        
        price_data = TELEGRAM_PRICES.get(price_key)
        if not price_data:
            await query.edit_message_text("❌ Ungültiger Preisplan")
            return
        
        telegram_id = str(update.effective_user.id)
        chat_id = update.effective_chat.id
        
        # Create labeled prices
        prices = [
            LabeledPrice(
                label=price_data["title"],
                amount=price_data["amount"]
            )
        ]
        
        # Payload contains subscription info
        payload = f"{price_key}_{telegram_id}_{datetime.now(timezone.utc).timestamp()}"
        
        # Store pending payment
        await self.db.pending_telegram_payments.insert_one({
            "telegram_id": telegram_id,
            "payload": payload,
            "price_key": price_key,
            "plan": price_data["plan"],
            "interval": price_data["interval"],
            "amount": price_data["amount"],
            "currency": price_data["currency"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "pending"
        })
        
        # Send invoice
        await context.bot.send_invoice(
            chat_id=chat_id,
            title=price_data["title"],
            description=price_data["description"],
            payload=payload,
            provider_token=self.provider_token,
            currency=price_data["currency"],
            prices=prices,
            start_parameter=f"upgrade-{price_key}",
            need_name=False,
            need_phone_number=False,
            need_email=True,
            need_shipping_address=False,
            is_flexible=False,
            protect_content=True
        )
        
        logger.info(f"Invoice sent: telegram_id={telegram_id}, price_key={price_key}")
    
    async def handle_pre_checkout(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle pre-checkout query - validate the payment"""
        
        query = update.pre_checkout_query
        
        # Parse payload
        payload_parts = query.invoice_payload.split("_")
        if len(payload_parts) < 2:
            await query.answer(ok=False, error_message="Ungültige Zahlungsanfrage")
            return
        
        price_key = payload_parts[0] + "_" + payload_parts[1]
        telegram_id = payload_parts[2] if len(payload_parts) > 2 else str(query.from_user.id)
        
        # Verify price key exists
        if price_key not in TELEGRAM_PRICES:
            await query.answer(ok=False, error_message="Ungültiger Preisplan")
            return
        
        # Verify amount matches
        expected_amount = TELEGRAM_PRICES[price_key]["amount"]
        if query.total_amount != expected_amount:
            await query.answer(ok=False, error_message="Preisabweichung erkannt")
            return
        
        # All checks passed
        await query.answer(ok=True)
        logger.info(f"Pre-checkout approved: telegram_id={telegram_id}, price_key={price_key}")
    
    async def handle_successful_payment(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle successful payment - activate subscription"""
        
        payment = update.message.successful_payment
        telegram_id = str(update.effective_user.id)
        
        # Parse payload
        payload_parts = payment.invoice_payload.split("_")
        price_key = payload_parts[0] + "_" + payload_parts[1] if len(payload_parts) >= 2 else None
        
        if not price_key or price_key not in TELEGRAM_PRICES:
            await update.message.reply_text("❌ Fehler bei der Zahlungsverarbeitung")
            return
        
        price_data = TELEGRAM_PRICES[price_key]
        plan = price_data["plan"]
        interval = price_data["interval"]
        
        # Update pending payment status
        await self.db.pending_telegram_payments.update_one(
            {"telegram_id": telegram_id, "price_key": price_key, "status": "pending"},
            {"$set": {
                "status": "completed",
                "payment_id": payment.telegram_payment_charge_id,
                "provider_payment_id": payment.provider_payment_charge_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Get or create user in telegram_users
        telegram_user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if telegram_user:
            # Update subscription
            await self.db.telegram_users.update_one(
                {"telegram_id": telegram_id},
                {"$set": {
                    "subscription_level": plan,
                    "billing_interval": interval,
                    "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        
        # Check if linked to website user
        linked_user_id = telegram_user.get("linked_user_id") if telegram_user else None
        
        if linked_user_id:
            # Create/update subscription via subscription service
            await self.subscription_service.create_subscription(
                user_id=linked_user_id,
                plan=plan,
                provider="telegram",
                billing_interval=interval
            )
            
            # Record payment
            user = await self.db.users.find_one({"id": linked_user_id}, {"_id": 0})
            if user:
                await self.subscription_service.record_payment(
                    user_id=linked_user_id,
                    user_email=user.get("email", ""),
                    provider="telegram",
                    amount=price_data["amount"] / 100,
                    currency=price_data["currency"].lower(),
                    external_payment_id=payment.telegram_payment_charge_id,
                    payment_type="subscription",
                    status="completed"
                )
        
        # Send success message
        plan_name = "PRO" if plan == "pro" else "ELITE"
        interval_text = "Monat" if interval == "monthly" else "Jahr"
        
        success_message = f"""
🎉 *Zahlung erfolgreich!*

Dein *{plan_name}*-Zugang ist jetzt aktiv.

Du erhältst ab sofort:
"""
        
        if plan == "pro":
            success_message += """
• Unbegrenzte Live-Signale
• Echtzeit Telegram Alerts
• Execution Score
• Confidence Bewertung
• Risk Score
• Zugriff auf 5 Ligen
"""
        else:  # elite
            success_message += """
• Alles aus PRO
• Signal Lifetime Prediction
• Erweiterte Explain Layer
• Personalisierte Signalfilter
• Signal-Historie
• Zugriff auf 8 Ligen
• Schnellere Signalerkennung
"""
        
        success_message += f"""
━━━━━━━━━━━━━━━━━━━━━

📅 Abrechnungszeitraum: 1 {interval_text}
💳 Zahlungs-ID: `{payment.telegram_payment_charge_id[:20]}...`

Bei Fragen wende dich an @betradarmus\\_support
"""
        
        keyboard = [[
            InlineKeyboardButton("📊 Mein Status", callback_data="check_status"),
            InlineKeyboardButton("🎯 Signale aktivieren", callback_data="settings_leagues")
        ]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            success_message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
        
        logger.info(f"Payment successful: telegram_id={telegram_id}, plan={plan}, amount={price_data['amount']}")
    
    async def show_subscription_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show current subscription status"""
        
        query = update.callback_query
        if query:
            await query.answer()
        
        telegram_id = str(update.effective_user.id)
        telegram_user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not telegram_user:
            message = "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            if query:
                await query.edit_message_text(message)
            else:
                await update.message.reply_text(message)
            return
        
        plan = telegram_user.get("subscription_level", "free")
        plan_icons = {"free": "⭐", "pro": "⚡", "elite": "👑"}
        plan_icon = plan_icons.get(plan, "⭐")
        
        linked_user_id = telegram_user.get("linked_user_id")
        linked_status = "✅ Verknüpft" if linked_user_id else "❌ Nicht verknüpft"
        
        status_message = f"""
📊 *Dein BETRADARMUS Status*

━━━━━━━━━━━━━━━━━━━━━

{plan_icon} *Plan:* {plan.upper()}
🔗 *Website-Konto:* {linked_status}
📅 *Mitglied seit:* {telegram_user.get('created_at', 'Unbekannt')[:10]}

━━━━━━━━━━━━━━━━━━━━━

*Deine Features:*
"""
        
        if plan == "free":
            status_message += """
• 5 Signale pro Tag
• 15 Min. Signalverzögerung
• 2 Ligen
• Basis-Alerts
"""
        elif plan == "pro":
            status_message += """
• Unbegrenzte Signale ✓
• Echtzeit-Signale ✓
• Execution Score ✓
• Confidence ✓
• Risk Score ✓
• 5 Ligen
"""
        else:  # elite
            status_message += """
• Alle PRO Features ✓
• Signal Lifetime ✓
• Explain Layer ✓
• Personalisierte Filter ✓
• Signal-Historie ✓
• 8 Ligen
"""
        
        keyboard = []
        
        if plan == "free":
            keyboard.append([
                InlineKeyboardButton("⚡ Upgrade auf PRO", callback_data="upgrade_pro"),
                InlineKeyboardButton("👑 Upgrade auf ELITE", callback_data="upgrade_elite")
            ])
        elif plan == "pro":
            keyboard.append([
                InlineKeyboardButton("👑 Upgrade auf ELITE", callback_data="upgrade_elite")
            ])
        
        if not linked_user_id:
            keyboard.append([
                InlineKeyboardButton("🔗 Website-Konto verknüpfen", callback_data="link_account")
            ])
        
        keyboard.append([
            InlineKeyboardButton("⚙️ Abo verwalten", callback_data="manage_subscription")
        ])
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        if query:
            await query.edit_message_text(
                status_message,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=reply_markup
            )
        else:
            await update.message.reply_text(
                status_message,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=reply_markup
            )
    
    async def show_manage_subscription(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show subscription management options"""
        
        query = update.callback_query
        await query.answer()
        
        telegram_id = str(update.effective_user.id)
        telegram_user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        plan = telegram_user.get("subscription_level", "free") if telegram_user else "free"
        
        if plan == "free":
            message = """
⚙️ *Abo verwalten*

Du hast derzeit den FREE Plan.
Upgrade auf PRO oder ELITE für erweiterte Features!
"""
            keyboard = [
                [InlineKeyboardButton("⚡ PRO freischalten", callback_data="upgrade_pro")],
                [InlineKeyboardButton("👑 ELITE freischalten", callback_data="upgrade_elite")],
                [InlineKeyboardButton("◀️ Zurück", callback_data="check_status")]
            ]
        else:
            message = f"""
⚙️ *Abo verwalten*

Dein aktueller Plan: *{plan.upper()}*

Um dein Abo zu kündigen oder die Zahlungsmethode zu ändern, besuche bitte:
👉 [betradarmus.de/account](https://betradarmus.de/account)

Für Support: @betradarmus\\_support
"""
            keyboard = [
                [InlineKeyboardButton("🌐 Zur Website", url="https://betradarmus.de/account")],
                [InlineKeyboardButton("◀️ Zurück", callback_data="check_status")]
            ]
        
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup,
            disable_web_page_preview=True
        )
    
    async def show_link_account_info(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Show how to link Telegram account with website"""
        
        query = update.callback_query
        await query.answer()
        
        message = """
🔗 *Website-Konto verknüpfen*

Um dein Telegram mit deinem Website-Konto zu verknüpfen:

1️⃣ Gehe zu [betradarmus.de](https://betradarmus.de)
2️⃣ Logge dich ein oder registriere dich
3️⃣ Gehe zu *Account* → *Telegram verknüpfen*
4️⃣ Kopiere den Code und sende ihn mir hier

*Vorteile der Verknüpfung:*
• Zahlungen auf der Website werden automatisch hier aktiv
• Einheitlicher Subscription-Status
• Synchronisierte Einstellungen

Hast du bereits einen Code? Sende ihn mir direkt!
"""
        
        keyboard = [
            [InlineKeyboardButton("🌐 Zur Website", url="https://betradarmus.de")],
            [InlineKeyboardButton("◀️ Zurück", callback_data="check_status")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await query.edit_message_text(
            message,
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup,
            disable_web_page_preview=True
        )
    
    async def handle_link_code(self, update: Update, context: ContextTypes.DEFAULT_TYPE, code: str):
        """Handle link code submission"""
        
        telegram_id = str(update.effective_user.id)
        
        # Try to link account
        result = await self.subscription_service.link_telegram_account(code.upper(), telegram_id)
        
        if result:
            await update.message.reply_text(
                "✅ *Erfolgreich verknüpft!*\n\n"
                "Dein Telegram ist jetzt mit deinem Website-Konto verbunden.\n"
                "Dein Subscription-Status wird automatisch synchronisiert.",
                parse_mode=ParseMode.MARKDOWN
            )
        else:
            await update.message.reply_text(
                "❌ *Ungültiger oder abgelaufener Code*\n\n"
                "Bitte generiere einen neuen Code auf der Website:\n"
                "betradarmus.de → Account → Telegram verknüpfen",
                parse_mode=ParseMode.MARKDOWN
            )
    
    # ==================== PAYWALL TRIGGERS ====================
    
    async def send_upgrade_prompt(
        self, 
        chat_id: int, 
        bot, 
        trigger_type: str = "signal_delayed",
        target_plan: str = "pro"
    ):
        """Send upgrade prompt at strategic moments"""
        
        prompts = {
            "signal_delayed": {
                "message": "⏱️ *Dieses Signal wäre für PRO Nutzer früher sichtbar gewesen.*\n\nMit PRO erhältst du Echtzeit-Signale ohne Verzögerung.",
                "button": "⚡ PRO freischalten",
                "callback": "upgrade_pro"
            },
            "signal_limit": {
                "message": "📊 *Du hast dein tägliches Signal-Limit erreicht.*\n\nMit PRO erhältst du unbegrenzte Signale.",
                "button": "⚡ PRO freischalten",
                "callback": "upgrade_pro"
            },
            "lifetime_locked": {
                "message": "🔮 *Die Restlaufzeit dieses Signals ist nur für ELITE verfügbar.*\n\nMit ELITE siehst du, wie lange ein Signal noch gültig ist.",
                "button": "👑 ELITE freischalten",
                "callback": "upgrade_elite"
            },
            "explain_locked": {
                "message": "🧠 *Die detaillierte Analyse ist nur für ELITE verfügbar.*\n\nMit ELITE erhältst du tiefere Einblicke in die Signallogik.",
                "button": "👑 ELITE freischalten",
                "callback": "upgrade_elite"
            }
        }
        
        prompt = prompts.get(trigger_type, prompts["signal_delayed"])
        
        keyboard = [[
            InlineKeyboardButton(prompt["button"], callback_data=prompt["callback"])
        ]]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await bot.send_message(
            chat_id=chat_id,
            text=prompt["message"],
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
