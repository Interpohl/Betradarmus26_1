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

# Subscription level limits
SUBSCRIPTION_LIMITS = {
    "free": {"max_leagues": 2, "min_confidence": 0.75, "signals_per_day": 5},
    "pro": {"max_leagues": 5, "min_confidence": 0.60, "signals_per_day": 50},
    "elite": {"max_leagues": 8, "min_confidence": 0.50, "signals_per_day": -1}  # -1 = unlimited
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
        self.application.add_handler(CallbackQueryHandler(self.handle_callback))
        
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

*Nächste Schritte:*
1️⃣ /subscribe - Wähle deine Ligen
2️⃣ /settings - Passe Einstellungen an
3️⃣ /status - Zeige deinen Status

Upgrade auf PRO oder ELITE unter betradarmus.de für mehr Signale!
"""
        await update.message.reply_text(welcome_text, parse_mode=ParseMode.MARKDOWN)
        
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
└ Signale/Tag: {"Unbegrenzt" if signals_limit < 0 else signals_limit}

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
/help - Diese Hilfe anzeigen

*Was sind Signale?*
Unsere KI analysiert Live-Fußballmärkte und erkennt Ineffizienzen. Wenn eine Gelegenheit erkannt wird, erhältst du ein Signal mit:
• Spiel & Liga
• Markt (z.B. Over 2.5)
• Confidence Score
• Risk Score

*Subscription Levels:*
• FREE: 2 Ligen, 5 Signale/Tag
• PRO: 5 Ligen, 50 Signale/Tag
• ELITE: 8 Ligen, Unbegrenzt

Upgrade: betradarmus.de
Support: support@betradarmus.de
"""
        await update.message.reply_text(help_text, parse_mode=ParseMode.MARKDOWN)
        
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
        """Distribute a signal to matching users"""
        results = {"sent": 0, "filtered": 0, "failed": 0}
        
        # Find matching users
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
                
            # Format and queue the message
            message = self._format_signal_message(signal)
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
        """Format a signal into a Telegram message"""
        confidence = signal.get("confidence", 0)
        risk_score = signal.get("risk_score", 0)
        
        # Confidence emoji
        if confidence >= 0.80:
            conf_emoji = "🟢"
        elif confidence >= 0.70:
            conf_emoji = "🟡"
        else:
            conf_emoji = "🔴"
            
        # Risk emoji
        if risk_score <= 30:
            risk_emoji = "🟢"
        elif risk_score <= 60:
            risk_emoji = "🟡"
        else:
            risk_emoji = "🔴"
            
        message = f"""
⚡ *BETRADARMUS LIVE SIGNAL*

🏟️ *Spiel:* {signal.get('match', 'N/A')}
🏆 *Liga:* {signal.get('league', 'N/A')}

📊 *Markt:* {signal.get('market', 'N/A')}
{conf_emoji} *Confidence:* {int(confidence * 100)}%
{risk_emoji} *Risk Score:* {risk_score}

📝 *Analyse:*
{signal.get('explanation', 'Market deviation detected.')}

🕐 *Zeit:* {signal.get('timestamp', datetime.now(timezone.utc).strftime('%H:%M'))}

_Keine Wettempfehlung - Nur zu Analysezwecken_
"""
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
