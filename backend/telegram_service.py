"""
BETRADARMUS Telegram Bot Service
Signal Distribution via Telegram
"""

import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from collections import deque
import os

from telegram import Update, Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes,
    MessageHandler,
    filters
)
from telegram.constants import ParseMode

logger = logging.getLogger(__name__)

# Available leagues for subscription
AVAILABLE_LEAGUES = [
    "Bundesliga",
    "Premier League", 
    "La Liga",
    "Serie A",
    "Ligue 1",
    "Champions League",
    "Europa League",
    "2. Bundesliga"
]

# Telegram Group/Channel Links
TELEGRAM_FREE_GROUP = "https://t.me/+Pb8X_nXzKu41N2Yy"
TELEGRAM_ELITE_CHANNEL = os.environ.get("TELEGRAM_ELITE_CHANNEL", "")  # Private channel invite link
TELEGRAM_ELITE_CHANNEL_ID = int(os.environ.get("TELEGRAM_ELITE_CHANNEL_ID", "-1001222696874"))  # Elite channel chat ID for direct posting

# Signal Logo for Telegram messages
SIGNAL_LOGO_URL = "https://static.prod-images.emergentagent.com/jobs/6730f064-f598-46a7-94e6-3fd4db78c461/images/ab487ae8f08093b2e2929301ff200cfb4ffb115de44ca166bfe85c0c68cee0df.png"

# Subscription level limits
SUBSCRIPTION_LIMITS = {
    "free": {"max_leagues": 2, "min_confidence": 0.75, "signals_per_day": 5, "channel": TELEGRAM_FREE_GROUP},
    "pro": {"max_leagues": 5, "min_confidence": 0.60, "signals_per_day": 50, "channel": None},
    "elite": {"max_leagues": 8, "min_confidence": 0.50, "signals_per_day": -1, "channel": TELEGRAM_ELITE_CHANNEL}  # -1 = unlimited
}


class SignalQueue:
    """In-memory queue for rate-limited signal distribution"""
    
    def __init__(self, max_per_second: int = 25):
        self.queue = deque()
        self.max_per_second = max_per_second
        self.processing = False
        
    async def add(self, telegram_id: str, message: str, parse_mode: str = ParseMode.MARKDOWN):
        """Add a message to the queue"""
        self.queue.append({
            "telegram_id": telegram_id,
            "message": message,
            "parse_mode": parse_mode,
            "added_at": datetime.now(timezone.utc),
            "retries": 0
        })
        
    def size(self) -> int:
        return len(self.queue)


class TelegramBotService:
    """Main Telegram Bot Service for BETRADARMUS"""
    
    def __init__(self, token: str, db):
        self.token = token
        self.db = db
        self.bot = Bot(token)
        self.application = None
        self.signal_queue = SignalQueue()
        self._queue_task = None
        
    async def initialize(self):
        """Initialize the bot application"""
        self.application = Application.builder().token(self.token).build()
        
        # Register handlers
        self.application.add_handler(CommandHandler("start", self.cmd_start))
        self.application.add_handler(CommandHandler("settings", self.cmd_settings))
        self.application.add_handler(CommandHandler("subscribe", self.cmd_subscribe))
        self.application.add_handler(CommandHandler("unsubscribe", self.cmd_unsubscribe))
        self.application.add_handler(CommandHandler("status", self.cmd_status))
        self.application.add_handler(CommandHandler("help", self.cmd_help))
        self.application.add_handler(CommandHandler("elite", self.cmd_elite))
        self.application.add_handler(CallbackQueryHandler(self.handle_callback))
        
        # Handler for new members in groups
        self.application.add_handler(MessageHandler(
            filters.StatusUpdate.NEW_CHAT_MEMBERS,
            self.handle_new_member
        ))
        
        # Initialize the application
        await self.application.initialize()
        
        # Start queue processor
        self._queue_task = asyncio.create_task(self._process_queue())
        
        logger.info("Telegram Bot Service initialized")
        
    async def start_polling(self):
        """Start the bot in polling mode"""
        if self.application:
            await self.application.start()
            await self.application.updater.start_polling(drop_pending_updates=True)
            logger.info("Telegram Bot polling started")
            
    async def stop(self):
        """Stop the bot"""
        if self._queue_task:
            self._queue_task.cancel()
        if self.application:
            await self.application.updater.stop()
            await self.application.stop()
            await self.application.shutdown()
            
    # ==================== COMMAND HANDLERS ====================
    
    async def cmd_start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command - Register user"""
        user = update.effective_user
        telegram_id = str(user.id)
        
        # Check if user already exists
        existing = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if existing:
            await update.message.reply_text(
                f"👋 Willkommen zurück, {user.first_name}!\n\n"
                f"Du bist bereits registriert.\n"
                f"Nutze /settings um deine Einstellungen zu ändern.\n"
                f"Nutze /status um deinen aktuellen Status zu sehen.",
                parse_mode=ParseMode.MARKDOWN
            )
            return
            
        # Create new telegram user
        telegram_user = {
            "telegram_id": telegram_id,
            "telegram_username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "subscription_level": "free",
            "leagues": [],
            "min_confidence": 0.75,
            "alerts_enabled": True,
            "signals_today": 0,
            "last_signal_date": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.telegram_users.insert_one(telegram_user)
        
        welcome_text = f"""
🎯 *Willkommen bei BETRADARMUS!*

Hallo {user.first_name}! Du bist jetzt registriert.

*Was ist BETRADARMUS?*
Live-Fußball intelligent analysiert. Wir erkennen Markt-Ineffizienzen und senden dir Signale direkt auf Telegram.

*Dein aktueller Plan:* FREE
• Max. 2 Ligen
• Min. Confidence: 75%
• 5 Signale pro Tag

👥 *Tritt unserer FREE Community bei:*
[Hier klicken zum Beitreten]({TELEGRAM_FREE_GROUP})

*Nächste Schritte:*
1️⃣ /subscribe - Wähle deine Ligen
2️⃣ /settings - Passe Einstellungen an
3️⃣ /status - Zeige deinen Status

Upgrade auf PRO oder ELITE unter betradarmus.de für mehr Signale!
"""
        await update.message.reply_text(welcome_text, parse_mode=ParseMode.MARKDOWN, disable_web_page_preview=True)
        
    async def cmd_settings(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /settings command - Show settings menu"""
        telegram_id = str(update.effective_user.id)
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            await update.message.reply_text(
                "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            )
            return
            
        keyboard = [
            [InlineKeyboardButton("📊 Ligen verwalten", callback_data="settings_leagues")],
            [InlineKeyboardButton("🎯 Min. Confidence ändern", callback_data="settings_confidence")],
            [InlineKeyboardButton("🔔 Benachrichtigungen", callback_data="settings_alerts")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        alerts_status = "✅ Aktiv" if user.get("alerts_enabled", True) else "❌ Deaktiviert"
        leagues_text = ", ".join(user.get("leagues", [])) or "Keine"
        
        settings_text = f"""
⚙️ *Deine Einstellungen*

*Plan:* {user.get('subscription_level', 'free').upper()}
*Ligen:* {leagues_text}
*Min. Confidence:* {int(user.get('min_confidence', 0.75) * 100)}%
*Benachrichtigungen:* {alerts_status}

Wähle eine Option zum Ändern:
"""
        await update.message.reply_text(
            settings_text, 
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
        
    async def cmd_subscribe(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /subscribe command - Subscribe to leagues"""
        telegram_id = str(update.effective_user.id)
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            await update.message.reply_text(
                "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            )
            return
            
        subscription = user.get("subscription_level", "free")
        limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
        current_leagues = user.get("leagues", [])
        
        # Create keyboard with available leagues
        keyboard = []
        for league in AVAILABLE_LEAGUES:
            if league in current_leagues:
                button_text = f"✅ {league}"
            else:
                button_text = f"➕ {league}"
            keyboard.append([InlineKeyboardButton(button_text, callback_data=f"sub_{league}")])
            
        keyboard.append([InlineKeyboardButton("✔️ Fertig", callback_data="sub_done")])
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            f"*Ligen auswählen*\n\n"
            f"Dein Plan: {subscription.upper()}\n"
            f"Max. Ligen: {limits['max_leagues']}\n"
            f"Aktuell: {len(current_leagues)}/{limits['max_leagues']}\n\n"
            f"Tippe auf eine Liga zum Hinzufügen/Entfernen:",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
        
    async def cmd_unsubscribe(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /unsubscribe command - Unsubscribe from leagues"""
        telegram_id = str(update.effective_user.id)
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            await update.message.reply_text(
                "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            )
            return
            
        current_leagues = user.get("leagues", [])
        
        if not current_leagues:
            await update.message.reply_text(
                "Du hast keine Ligen abonniert. Nutze /subscribe um Ligen hinzuzufügen."
            )
            return
            
        keyboard = []
        for league in current_leagues:
            keyboard.append([InlineKeyboardButton(f"❌ {league}", callback_data=f"unsub_{league}")])
        keyboard.append([InlineKeyboardButton("✔️ Fertig", callback_data="unsub_done")])
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(
            "*Ligen abbestellen*\n\n"
            "Tippe auf eine Liga zum Entfernen:",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=reply_markup
        )
        
    async def cmd_status(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /status command - Show current status"""
        telegram_id = str(update.effective_user.id)
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            await update.message.reply_text(
                "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            )
            return
            
        subscription = user.get("subscription_level", "free")
        limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
        leagues_text = ", ".join(user.get("leagues", [])) or "Keine ausgewählt"
        alerts_status = "✅ Aktiv" if user.get("alerts_enabled", True) else "❌ Deaktiviert"
        
        signals_today = user.get("signals_today", 0)
        signals_limit = limits["signals_per_day"]
        signals_text = f"{signals_today}/{signals_limit}" if signals_limit > 0 else f"{signals_today}/∞"
        
        # Add channel info for subscription level
        channel_text = ""
        channel_link = limits.get("channel", "")
        if subscription == "elite" and TELEGRAM_ELITE_CHANNEL:
            channel_text = f"\n\n🏆 *Elite-Kanal:*\nNutze /elite für den Kanal-Link"
        elif subscription == "free":
            channel_text = f"\n\n👥 *FREE Community:*\n[Hier beitreten]({TELEGRAM_FREE_GROUP})"
        
        status_text = f"""
📊 *BETRADARMUS Status*

*Account:*
├ Plan: {subscription.upper()}
├ Registriert: {user.get('created_at', 'N/A')[:10]}
└ Telegram: @{user.get('telegram_username', 'N/A')}

*Einstellungen:*
├ Ligen: {leagues_text}
├ Min. Confidence: {int(user.get('min_confidence', 0.75) * 100)}%
└ Benachrichtigungen: {alerts_status}

*Heute:*
└ Signale erhalten: {signals_text}

*Plan-Limits ({subscription.upper()}):*
├ Max. Ligen: {limits['max_leagues']}
├ Min. Confidence: {int(limits['min_confidence'] * 100)}%
└ Signale/Tag: {"Unbegrenzt" if signals_limit < 0 else signals_limit}{channel_text}

💡 Upgrade unter betradarmus.de
"""
        await update.message.reply_text(status_text, parse_mode=ParseMode.MARKDOWN)
        
    async def cmd_help(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = """
🤖 *BETRADARMUS Bot Hilfe*

*Verfügbare Befehle:*

/start - Registrierung starten
/settings - Einstellungen ändern
/subscribe - Ligen abonnieren
/unsubscribe - Ligen abbestellen
/status - Aktuellen Status anzeigen
/elite - Elite-Kanal beitreten (nur ELITE)
/help - Diese Hilfe anzeigen

*Was sind Signale?*
Unsere KI analysiert Live-Fußballmärkte und erkennt Ineffizienzen. Wenn eine Gelegenheit erkannt wird, erhältst du ein Signal mit:
• Spiel & Liga
• Markt (z.B. Over 2.5)
• Confidence Score
• Risk Score

*Subscription Levels:*
• FREE: 2 Ligen, 5 Signale/Tag, Community Gruppe
• PRO: 5 Ligen, 50 Signale/Tag
• ELITE: 8 Ligen, Unbegrenzt, VIP Signal-Kanal

Upgrade: betradarmus.de
Support: support@betradarmus.de
"""
        await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)
    
    async def handle_new_member(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle new members joining a group - Send welcome message"""
        if not update.message or not update.message.new_chat_members:
            return
            
        for new_member in update.message.new_chat_members:
            # Skip if the bot itself joined
            if new_member.is_bot:
                continue
                
            first_name = new_member.first_name or "Neues Mitglied"
            
            welcome_text = f"""
👋 *Willkommen in der BETRADARMUS Community, {first_name}!*

Schön, dass du dabei bist! 🎉

*Was erwartet dich hier:*
• 📊 Kostenlose KI-Signale
• 💬 Austausch mit anderen Mitgliedern
• 📈 Tipps & Insights zu Live-Fußball-Analysen

*Starte jetzt deinen Bot:*
👉 [Klicke hier: @Betradarmus\\_bot](https://t.me/Betradarmus_bot)

Sende /start an den Bot, um:
✅ Dich zu registrieren
✅ Deine Lieblings-Ligen zu wählen
✅ Personalisierte Signale zu erhalten

*Upgrade auf PRO/ELITE:*
Mehr Signale, mehr Ligen, exklusive Features!
🔗 betradarmus.de

Bei Fragen: support@betradarmus.de
"""
            try:
                await update.message.reply_text(
                    welcome_text,
                    parse_mode=ParseMode.MARKDOWN,
                    disable_web_page_preview=True
                )
                logger.info(f"Sent welcome message to new member: {new_member.username or new_member.id}")
            except Exception as e:
                logger.error(f"Failed to send welcome message: {e}")
    
    async def cmd_elite(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /elite command - Send Elite channel invite link"""
        telegram_id = str(update.effective_user.id)
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            await update.message.reply_text(
                "❌ Du bist noch nicht registriert. Nutze /start zuerst."
            )
            return
        
        subscription = user.get("subscription_level", "free")
        
        if subscription != "elite":
            await update.message.reply_text(
                f"⚠️ *Elite-Kanal nur für ELITE-Mitglieder*\n\n"
                f"Dein aktueller Plan: {subscription.upper()}\n\n"
                f"Mit dem ELITE-Plan erhältst du:\n"
                f"• 🚀 Unbegrenzte Signale\n"
                f"• 📺 Exklusiver VIP Signal-Kanal\n"
                f"• ⚡ Alle 8 Top-Ligen\n"
                f"• 🎯 Niedrigste Confidence-Schwelle\n"
                f"• 💬 Priority Support\n\n"
                f"👉 Upgrade jetzt unter: betradarmus.de",
                parse_mode=ParseMode.MARKDOWN
            )
            return
        
        # User is ELITE - send channel link
        if TELEGRAM_ELITE_CHANNEL:
            await update.message.reply_text(
                f"🏆 *Willkommen im ELITE-Kanal!*\n\n"
                f"Als ELITE-Mitglied hast du Zugang zu unserem\n"
                f"exklusiven VIP Signal-Kanal.\n\n"
                f"📺 *Elite Signal-Kanal:*\n"
                f"[Hier klicken zum Beitreten]({TELEGRAM_ELITE_CHANNEL})\n\n"
                f"Im Kanal erhältst du:\n"
                f"• Alle Signale in Echtzeit\n"
                f"• Detaillierte Analysen\n"
                f"• Exklusive Pre-Match Insights\n\n"
                f"⚠️ Teile diesen Link nicht mit anderen!",
                parse_mode=ParseMode.MARKDOWN,
                disable_web_page_preview=True
            )
        else:
            await update.message.reply_text(
                f"🏆 *Elite-Mitglied*\n\n"
                f"Der Elite-Kanal wird gerade eingerichtet.\n"
                f"Du wirst benachrichtigt, sobald er verfügbar ist!\n\n"
                f"Bei Fragen: support@betradarmus.de",
                parse_mode=ParseMode.MARKDOWN
            )
        
    # ==================== CALLBACK HANDLERS ====================
    
    async def handle_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline keyboard callbacks"""
        query = update.callback_query
        await query.answer()
        
        telegram_id = str(update.effective_user.id)
        data = query.data
        
        if data.startswith("sub_"):
            await self._handle_subscribe_callback(query, telegram_id, data)
        elif data.startswith("unsub_"):
            await self._handle_unsubscribe_callback(query, telegram_id, data)
        elif data.startswith("settings_"):
            await self._handle_settings_callback(query, telegram_id, data)
        elif data.startswith("conf_"):
            await self._handle_confidence_callback(query, telegram_id, data)
        elif data == "toggle_alerts":
            await self._handle_alerts_toggle(query, telegram_id)
            
    async def _handle_subscribe_callback(self, query, telegram_id: str, data: str):
        """Handle league subscription callbacks"""
        if data == "sub_done":
            await query.edit_message_text("✅ Ligen-Einstellungen gespeichert!")
            return
            
        league = data.replace("sub_", "")
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            return
            
        subscription = user.get("subscription_level", "free")
        limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
        current_leagues = user.get("leagues", [])
        
        if league in current_leagues:
            # Remove league
            current_leagues.remove(league)
        else:
            # Add league (check limit)
            if len(current_leagues) >= limits["max_leagues"]:
                await query.answer(
                    f"❌ Maximum {limits['max_leagues']} Ligen erreicht. Upgrade für mehr!",
                    show_alert=True
                )
                return
            current_leagues.append(league)
            
        # Update database
        await self.db.telegram_users.update_one(
            {"telegram_id": telegram_id},
            {"$set": {"leagues": current_leagues, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Update keyboard
        keyboard = []
        for lg in AVAILABLE_LEAGUES:
            if lg in current_leagues:
                button_text = f"✅ {lg}"
            else:
                button_text = f"➕ {lg}"
            keyboard.append([InlineKeyboardButton(button_text, callback_data=f"sub_{lg}")])
        keyboard.append([InlineKeyboardButton("✔️ Fertig", callback_data="sub_done")])
        
        await query.edit_message_text(
            f"*Ligen auswählen*\n\n"
            f"Aktuell: {len(current_leagues)}/{limits['max_leagues']}\n\n"
            f"Tippe auf eine Liga zum Hinzufügen/Entfernen:",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        
    async def _handle_unsubscribe_callback(self, query, telegram_id: str, data: str):
        """Handle league unsubscribe callbacks"""
        if data == "unsub_done":
            await query.edit_message_text("✅ Änderungen gespeichert!")
            return
            
        league = data.replace("unsub_", "")
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        
        if not user:
            return
            
        current_leagues = user.get("leagues", [])
        
        if league in current_leagues:
            current_leagues.remove(league)
            await self.db.telegram_users.update_one(
                {"telegram_id": telegram_id},
                {"$set": {"leagues": current_leagues, "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
        if not current_leagues:
            await query.edit_message_text("Du hast alle Ligen abbestellt. Nutze /subscribe um neue hinzuzufügen.")
            return
            
        keyboard = []
        for lg in current_leagues:
            keyboard.append([InlineKeyboardButton(f"❌ {lg}", callback_data=f"unsub_{lg}")])
        keyboard.append([InlineKeyboardButton("✔️ Fertig", callback_data="unsub_done")])
        
        await query.edit_message_text(
            "*Ligen abbestellen*\n\nTippe auf eine Liga zum Entfernen:",
            parse_mode=ParseMode.MARKDOWN,
            reply_markup=InlineKeyboardMarkup(keyboard)
        )
        
    async def _handle_settings_callback(self, query, telegram_id: str, data: str):
        """Handle settings menu callbacks"""
        if data == "settings_leagues":
            # Show subscribe menu
            user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
            subscription = user.get("subscription_level", "free")
            limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
            current_leagues = user.get("leagues", [])
            
            keyboard = []
            for league in AVAILABLE_LEAGUES:
                if league in current_leagues:
                    button_text = f"✅ {league}"
                else:
                    button_text = f"➕ {league}"
                keyboard.append([InlineKeyboardButton(button_text, callback_data=f"sub_{league}")])
            keyboard.append([InlineKeyboardButton("✔️ Fertig", callback_data="sub_done")])
            
            await query.edit_message_text(
                f"*Ligen auswählen*\n\nAktuell: {len(current_leagues)}/{limits['max_leagues']}",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        elif data == "settings_confidence":
            keyboard = [
                [InlineKeyboardButton("50%", callback_data="conf_50")],
                [InlineKeyboardButton("60%", callback_data="conf_60")],
                [InlineKeyboardButton("70%", callback_data="conf_70")],
                [InlineKeyboardButton("75%", callback_data="conf_75")],
                [InlineKeyboardButton("80%", callback_data="conf_80")],
                [InlineKeyboardButton("85%", callback_data="conf_85")],
            ]
            await query.edit_message_text(
                "*Min. Confidence wählen*\n\n"
                "Je höher, desto weniger aber qualitativere Signale.",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
        elif data == "settings_alerts":
            user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
            alerts_enabled = user.get("alerts_enabled", True)
            
            keyboard = [[InlineKeyboardButton(
                "🔕 Deaktivieren" if alerts_enabled else "🔔 Aktivieren",
                callback_data="toggle_alerts"
            )]]
            
            await query.edit_message_text(
                f"*Benachrichtigungen*\n\n"
                f"Status: {'✅ Aktiv' if alerts_enabled else '❌ Deaktiviert'}",
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=InlineKeyboardMarkup(keyboard)
            )
            
    async def _handle_confidence_callback(self, query, telegram_id: str, data: str):
        """Handle confidence level selection"""
        confidence = int(data.replace("conf_", "")) / 100
        
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        subscription = user.get("subscription_level", "free")
        limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
        
        if confidence < limits["min_confidence"]:
            await query.answer(
                f"❌ Dein Plan erlaubt min. {int(limits['min_confidence'] * 100)}%. Upgrade für niedrigere Werte!",
                show_alert=True
            )
            return
            
        await self.db.telegram_users.update_one(
            {"telegram_id": telegram_id},
            {"$set": {"min_confidence": confidence, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        await query.edit_message_text(
            f"✅ Min. Confidence auf {int(confidence * 100)}% gesetzt!"
        )
        
    async def _handle_alerts_toggle(self, query, telegram_id: str):
        """Toggle alerts on/off"""
        user = await self.db.telegram_users.find_one({"telegram_id": telegram_id})
        new_status = not user.get("alerts_enabled", True)
        
        await self.db.telegram_users.update_one(
            {"telegram_id": telegram_id},
            {"$set": {"alerts_enabled": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        await query.edit_message_text(
            f"✅ Benachrichtigungen {'aktiviert' if new_status else 'deaktiviert'}!"
        )
        
    # ==================== SIGNAL DISTRIBUTION ====================
    
    async def distribute_signal(self, signal: Dict[str, Any]) -> Dict[str, int]:
        """Distribute a signal to the Elite channel and matching individual users"""
        results = {"sent": 0, "filtered": 0, "failed": 0, "channel_sent": False}
        
        # Format the signal message
        message = self._format_signal_message(signal)
        
        # FIRST: Send directly to Elite Channel with Logo
        try:
            await self.bot.send_photo(
                chat_id=TELEGRAM_ELITE_CHANNEL_ID,
                photo=SIGNAL_LOGO_URL,
                caption=message,
                parse_mode=ParseMode.HTML
            )
            results["channel_sent"] = True
            results["sent"] += 1
            logger.info(f"Signal sent to Elite Channel {TELEGRAM_ELITE_CHANNEL_ID}")
        except Exception as e:
            logger.error(f"Failed to send signal to Elite Channel: {e}")
            # Fallback to text-only message
            try:
                await self.bot.send_message(
                    chat_id=TELEGRAM_ELITE_CHANNEL_ID,
                    text=message,
                    parse_mode=ParseMode.HTML
                )
                results["channel_sent"] = True
                results["sent"] += 1
                logger.info(f"Signal sent to Elite Channel (text fallback) {TELEGRAM_ELITE_CHANNEL_ID}")
            except Exception as e2:
                logger.error(f"Failed to send text signal to Elite Channel: {e2}")
                results["failed"] += 1
        
        # SECOND: Send to individual registered users (if any)
        query = {
            "alerts_enabled": True,
        }
        
        # Add league filter if signal has league
        signal_league = signal.get("league", "")
        
        users = await self.db.telegram_users.find(query).to_list(length=10000)
        
        for user in users:
            # Check if user subscribes to this league
            user_leagues = user.get("leagues", [])
            if user_leagues and signal_league and signal_league not in user_leagues:
                results["filtered"] += 1
                continue
                
            # Check confidence threshold
            user_min_conf = user.get("min_confidence", 0.75)
            signal_conf = signal.get("confidence", 0)
            if signal_conf < user_min_conf:
                results["filtered"] += 1
                continue
                
            # Check daily limit
            subscription = user.get("subscription_level", "free")
            limits = SUBSCRIPTION_LIMITS.get(subscription, SUBSCRIPTION_LIMITS["free"])
            signals_today = user.get("signals_today", 0)
            signals_limit = limits["signals_per_day"]
            
            if signals_limit > 0 and signals_today >= signals_limit:
                results["filtered"] += 1
                continue
                
            # Queue message for individual user
            await self.signal_queue.add(user["telegram_id"], message)
            
            # Update signals count
            await self.db.telegram_users.update_one(
                {"telegram_id": user["telegram_id"]},
                {
                    "$inc": {"signals_today": 1},
                    "$set": {"last_signal_date": datetime.now(timezone.utc).isoformat()}
                }
            )
            
            results["sent"] += 1
            
        return results
        
    def _format_signal_message(self, signal: Dict[str, Any]) -> str:
        """Format a signal into a premium Telegram message"""
        confidence = signal.get("confidence", 0)
        risk_score = signal.get("risk_score", 0)
        
        # Confidence emoji and text
        if confidence >= 0.80:
            conf_emoji = "🟢"
            conf_text = "SEHR HOCH"
        elif confidence >= 0.70:
            conf_emoji = "🟡"
            conf_text = "HOCH"
        elif confidence >= 0.60:
            conf_emoji = "🟠"
            conf_text = "MITTEL"
        else:
            conf_emoji = "🔴"
            conf_text = "NIEDRIG"
            
        # Risk emoji and text
        if risk_score <= 30:
            risk_emoji = "🟢"
            risk_text = "LOW"
        elif risk_score <= 60:
            risk_emoji = "🟡"
            risk_text = "MEDIUM"
        else:
            risk_emoji = "🔴"
            risk_text = "HIGH"
        
        # Get match and league
        match = signal.get('match', 'N/A')
        league = signal.get('league', 'N/A')
        market = signal.get('market', 'N/A')
        explanation = signal.get('explanation', 'Market analysis detected value opportunity.')
        timestamp = signal.get('timestamp', datetime.now(timezone.utc).strftime('%H:%M'))
        
        # Premium formatted message
        message = f"""━━━━━━━━━━━━━━━━━━━━━━
⚡ <b>BETRADARMUS SIGNAL</b> ⚡
━━━━━━━━━━━━━━━━━━━━━━

🏟️ <b>{match}</b>
🏆 {league}

┌─────────────────────
│ 📊 <b>Markt:</b> {market}
│ {conf_emoji} <b>Confidence:</b> {int(confidence * 100)}% ({conf_text})
│ {risk_emoji} <b>Risk:</b> {risk_text} ({risk_score}%)
└─────────────────────

📝 <b>Analyse:</b>
<i>{explanation}</i>

⏰ {timestamp} | #Signal #{league.replace(' ', '')}
━━━━━━━━━━━━━━━━━━━━━━
⚠️ <i>Keine Wettempfehlung - Nur zu Analysezwecken</i>
🌐 betradarmus.de"""
        return message
        
    async def _process_queue(self):
        """Background task to process the signal queue with rate limiting"""
        while True:
            try:
                if self.signal_queue.size() > 0:
                    batch_size = min(self.signal_queue.max_per_second, self.signal_queue.size())
                    
                    for _ in range(batch_size):
                        if self.signal_queue.size() == 0:
                            break
                            
                        item = self.signal_queue.queue.popleft()
                        
                        try:
                            await self.bot.send_message(
                                chat_id=item["telegram_id"],
                                text=item["message"],
                                parse_mode=item["parse_mode"]
                            )
                        except Exception as e:
                            logger.error(f"Failed to send message to {item['telegram_id']}: {e}")
                            
                            # Retry logic
                            if item["retries"] < 3:
                                item["retries"] += 1
                                self.signal_queue.queue.append(item)
                                
                await asyncio.sleep(1)  # Process batch every second
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Queue processing error: {e}")
                await asyncio.sleep(1)
                
    async def send_direct_message(self, telegram_id: str, message: str) -> bool:
        """Send a direct message to a user"""
        try:
            await self.bot.send_message(
                chat_id=telegram_id,
                text=message,
                parse_mode=ParseMode.MARKDOWN
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send direct message: {e}")
            return False
            
    async def get_bot_info(self) -> Dict[str, Any]:
        """Get bot information"""
        try:
            me = await self.bot.get_me()
            return {
                "id": me.id,
                "username": me.username,
                "first_name": me.first_name,
                "can_join_groups": me.can_join_groups,
                "can_read_all_group_messages": me.can_read_all_group_messages,
                "supports_inline_queries": me.supports_inline_queries
            }
        except Exception as e:
            logger.error(f"Failed to get bot info: {e}")
            return {}


# Singleton instance
_telegram_service: Optional[TelegramBotService] = None


def get_telegram_service() -> Optional[TelegramBotService]:
    """Get the telegram service instance"""
    return _telegram_service


async def init_telegram_service(token: str, db) -> TelegramBotService:
    """Initialize the telegram service"""
    global _telegram_service
    _telegram_service = TelegramBotService(token, db)
    await _telegram_service.initialize()
    return _telegram_service
