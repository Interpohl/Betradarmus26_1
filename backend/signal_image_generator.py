"""
BETRADARMUS Signal Image Generator v2
Mobile-optimized signal cards for Telegram
VERTICAL layout with LARGE readable text
"""

import io
from PIL import Image, ImageDraw, ImageFont
from pilmoji import Pilmoji
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Colors - matching BETRADARMUS homepage
COLORS = {
    'background': '#000000',
    'card_bg': '#0a0a0a',
    'green': '#39FF14',
    'yellow': '#FFD700',
    'red': '#FF4444',
    'white': '#FFFFFF',
    'gray': '#888888',
    'dark_gray': '#333333',
    'cyan': '#00C2FF'
}

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_confidence_color(confidence: float) -> str:
    """Get color based on confidence level"""
    if confidence >= 0.75:
        return COLORS['green']
    elif confidence >= 0.60:
        return COLORS['yellow']
    else:
        return COLORS['red']

def get_risk_color(risk_score: int) -> str:
    """Get color based on risk score"""
    if risk_score <= 35:
        return COLORS['green']
    elif risk_score <= 60:
        return COLORS['yellow']
    else:
        return COLORS['red']

def create_signal_image(signal: Dict[str, Any]) -> io.BytesIO:
    """
    Create a MOBILE-OPTIMIZED signal card
    VERTICAL layout, HUGE text, maximum readability
    """
    
    # VERTICAL format for mobile - taller than wide
    width = 1080
    height = 1920
    
    # Create image
    img = Image.new('RGB', (width, height), hex_to_rgb('#000000'))
    draw = ImageDraw.Draw(img)
    pilmoji = Pilmoji(img)
    
    # Load fonts - EXTRA LARGE for mobile
    try:
        font_header = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_match = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
        font_league = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
        font_market = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 56)
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 44)
        font_number = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 160)
        font_percent = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_disclaimer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
    except Exception as e:
        logger.warning(f"Font loading failed: {e}, using defaults")
        font_header = ImageFont.load_default()
        font_match = font_header
        font_league = font_header
        font_market = font_header
        font_label = font_header
        font_number = font_header
        font_percent = font_header
        font_brand = font_header
        font_disclaimer = font_header
    
    # Extract signal data
    match = signal.get('match', 'Team A vs Team B')
    league = signal.get('league', 'League')
    market = signal.get('market', 'Market')
    confidence = signal.get('confidence', 0.75)
    risk_score = signal.get('risk_score', 30)
    timestamp = signal.get('timestamp', datetime.now(timezone.utc).strftime('%H:%M'))
    odds = signal.get('odds', None)
    
    # Split match into two teams if possible
    teams = match.split(' vs ')
    if len(teams) == 2:
        team1, team2 = teams[0].strip(), teams[1].strip()
    else:
        team1, team2 = match, ""
    
    # Padding
    pad = 60
    y = 80
    
    # === TOP: NEON GREEN BAR ===
    draw.rectangle([0, 0, width, 12], fill=hex_to_rgb('#39FF14'))
    
    # === HEADER: ⚡ LIVE SIGNAL ===
    header_text = "LIVE SIGNAL"
    pilmoji.text((pad, y), "⚡", fill=hex_to_rgb('#39FF14'), font=font_header)
    draw.text((pad + 90, y), header_text, fill=hex_to_rgb('#39FF14'), font=font_header)
    y += 120
    
    # === LEAGUE ===
    pilmoji.text((pad, y), f"🏆 {league}", fill=hex_to_rgb('#888888'), font=font_league)
    y += 90
    
    # === TEAM 1 ===
    draw.text((pad, y), team1, fill=hex_to_rgb('#FFFFFF'), font=font_match)
    y += 90
    
    # === VS ===
    draw.text((pad, y), "vs", fill=hex_to_rgb('#39FF14'), font=font_league)
    y += 70
    
    # === TEAM 2 ===
    draw.text((pad, y), team2, fill=hex_to_rgb('#FFFFFF'), font=font_match)
    y += 130
    
    # === MARKET BOX ===
    market_box_y = y
    market_box_height = 140
    
    draw.rounded_rectangle(
        [pad, market_box_y, width - pad, market_box_y + market_box_height],
        radius=20,
        fill=hex_to_rgb('#111111'),
        outline=hex_to_rgb('#39FF14'),
        width=4
    )
    
    # Market text centered
    market_text = f"📊 {market}"
    market_bbox = draw.textbbox((0, 0), market, font=font_market)
    market_text_width = market_bbox[2] - market_bbox[0]
    market_x = (width - market_text_width - 70) // 2
    market_text_y = market_box_y + (market_box_height - 56) // 2
    pilmoji.text((market_x, market_text_y), market_text, fill=hex_to_rgb('#39FF14'), font=font_market)
    y = market_box_y + market_box_height + 60
    
    # === CONFIDENCE SECTION ===
    conf_box_height = 280
    draw.rounded_rectangle(
        [pad, y, width - pad, y + conf_box_height],
        radius=20,
        fill=hex_to_rgb('#0d0d0d'),
        outline=hex_to_rgb('#1a1a1a'),
        width=2
    )
    
    # Label
    draw.text((pad + 40, y + 25), "CONFIDENCE", fill=hex_to_rgb('#888888'), font=font_label)
    
    # Big number - NEON RED
    conf_value = f"{int(confidence * 100)}"
    neon_red = '#FF0040'  # Neon Red
    
    # Center the confidence number (fixed x position for alignment)
    center_x = width // 2
    conf_bbox = draw.textbbox((0, 0), conf_value, font=font_number)
    conf_num_width = conf_bbox[2] - conf_bbox[0]
    conf_x = center_x - (conf_num_width // 2) - 40
    draw.text((conf_x, y + 80), conf_value, fill=hex_to_rgb(neon_red), font=font_number)
    draw.text((conf_x + conf_num_width + 10, y + 140), "%", fill=hex_to_rgb(neon_red), font=font_percent)
    
    y += conf_box_height + 40
    
    # === RISK SCORE SECTION ===
    risk_box_height = 280
    draw.rounded_rectangle(
        [pad, y, width - pad, y + risk_box_height],
        radius=20,
        fill=hex_to_rgb('#0d0d0d'),
        outline=hex_to_rgb('#1a1a1a'),
        width=2
    )
    
    # Label
    draw.text((pad + 40, y + 25), "RISK SCORE", fill=hex_to_rgb('#888888'), font=font_label)
    
    # Big number - NEON RED
    risk_value = str(risk_score)
    
    # Center the risk number (same x position as confidence for alignment)
    risk_bbox = draw.textbbox((0, 0), risk_value, font=font_number)
    risk_num_width = risk_bbox[2] - risk_bbox[0]
    risk_x = center_x - (risk_num_width // 2)
    draw.text((risk_x, y + 80), risk_value, fill=hex_to_rgb(neon_red), font=font_number)
    
    # Risk level text - also NEON RED
    if risk_score <= 35:
        risk_level = "LOW RISK"
    elif risk_score <= 60:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH RISK"
    
    level_bbox = draw.textbbox((0, 0), risk_level, font=font_label)
    level_x = (width - (level_bbox[2] - level_bbox[0])) // 2
    draw.text((level_x, y + 220), risk_level, fill=hex_to_rgb(neon_red), font=font_label)
    
    y += risk_box_height + 60
    
    # === ODDS (if provided) ===
    if odds:
        odds_text = f"Quote: {odds}"
        odds_bbox = draw.textbbox((0, 0), odds_text, font=font_market)
        odds_x = (width - (odds_bbox[2] - odds_bbox[0])) // 2
        draw.text((odds_x, y), odds_text, fill=hex_to_rgb('#00C2FF'), font=font_market)
        y += 90
    
    # === TIMESTAMP ===
    time_text = f"🕐 {timestamp} Uhr"
    pilmoji.text((pad, y), time_text, fill=hex_to_rgb('#666666'), font=font_label)
    y += 80
    
    # === BOTTOM SECTION ===
    # Neon green line
    draw.rectangle([pad, height - 280, width - pad, height - 276], fill=hex_to_rgb('#39FF14'))
    
    # Brand
    brand_text = "BETRADARMUS.DE"
    brand_bbox = draw.textbbox((0, 0), brand_text, font=font_brand)
    brand_x = (width - (brand_bbox[2] - brand_bbox[0])) // 2
    draw.text((brand_x, height - 220), brand_text, fill=hex_to_rgb('#39FF14'), font=font_brand)
    
    # Disclaimer
    disclaimer = "KI-Signal powered by betradarmus.de"
    disc_bbox = draw.textbbox((0, 0), disclaimer, font=font_disclaimer)
    disc_x = (width - (disc_bbox[2] - disc_bbox[0])) // 2
    draw.text((disc_x, height - 140), disclaimer, fill=hex_to_rgb('#444444'), font=font_disclaimer)
    
    # 18+ Badge
    badge_text = "18+"
    draw.rounded_rectangle(
        [width - 150, height - 100, width - 60, height - 50],
        radius=10,
        fill=hex_to_rgb('#FF4444'),
        outline=None
    )
    draw.text((width - 135, height - 95), badge_text, fill=hex_to_rgb('#FFFFFF'), font=font_disclaimer)
    
    # Bottom neon bar
    draw.rectangle([0, height - 12, width, height], fill=hex_to_rgb('#39FF14'))
    
    # Save
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG', quality=95)
    img_bytes.seek(0)
    
    return img_bytes


def create_signal_image_with_logo(signal: Dict[str, Any], logo_url: Optional[str] = None) -> io.BytesIO:
    """Create a signal card with optional logo overlay"""
    return create_signal_image(signal)


# Test function
if __name__ == "__main__":
    test_signal = {
        "match": "Bayern München vs Borussia Dortmund",
        "league": "Bundesliga",
        "market": "Over 2.5 Goals",
        "confidence": 0.82,
        "risk_score": 25,
        "timestamp": "14:32",
        "odds": "1.85"
    }
    
    img_bytes = create_signal_image(test_signal)
    
    with open("/tmp/test_signal_v2.png", "wb") as f:
        f.write(img_bytes.read())
    
    print("Test image saved to /tmp/test_signal_v2.png")
