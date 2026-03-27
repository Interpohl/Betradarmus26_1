"""
BETRADARMUS Signal Image Generator
Creates professional signal cards for Telegram
"""

import io
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timezone
import requests
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

# Colors - matching BETRADARMUS homepage
COLORS = {
    'background': '#000000',      # Pure black like homepage
    'card_bg': '#0d0d0d',         # Very dark card
    'card_border': '#1a1a1a',     # Subtle border
    'market_bg': '#111111',       # Dark market box
    'green': '#39FF14',           # BETRADARMUS neon green
    'yellow': '#FFD700',          # Warning yellow
    'red': '#FF4444',             # Risk red
    'white': '#FFFFFF',           # Pure white
    'gray': '#71717A',            # Muted gray (zinc-500)
    'cyan': '#00D4FF'             # Accent cyan
}

def hex_to_rgb(hex_color: str) -> tuple:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def get_confidence_color(confidence: float) -> str:
    """Get color based on confidence level"""
    if confidence >= 0.80:
        return COLORS['green']
    elif confidence >= 0.70:
        return COLORS['yellow']
    else:
        return COLORS['red']

def get_risk_color(risk_score: int) -> str:
    """Get color based on risk score"""
    if risk_score <= 30:
        return COLORS['green']
    elif risk_score <= 60:
        return COLORS['yellow']
    else:
        return COLORS['red']

def create_signal_image(signal: Dict[str, Any]) -> io.BytesIO:
    """
    Create a professional signal card image - BETRADARMUS Design
    Large, readable text matching the website style
    
    Args:
        signal: Dictionary containing match, league, market, confidence, risk_score, timestamp
    
    Returns:
        BytesIO object containing the PNG image
    """
    
    # Image dimensions - large and clear
    width = 900
    height = 700
    
    # Create image with pure black background
    img = Image.new('RGB', (width, height), hex_to_rgb('#000000'))
    draw = ImageDraw.Draw(img)
    
    # Load fonts - LARGE and readable
    try:
        font_header = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
        font_match = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
        font_league = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        font_market = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
        font_number = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        font_percent = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
        font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except Exception:
        font_header = ImageFont.load_default()
        font_match = ImageFont.load_default()
        font_league = ImageFont.load_default()
        font_market = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_number = ImageFont.load_default()
        font_percent = ImageFont.load_default()
        font_footer = ImageFont.load_default()
    
    # Extract signal data
    match = signal.get('match', 'Team A vs Team B')
    league = signal.get('league', 'League')
    market = signal.get('market', 'Market')
    confidence = signal.get('confidence', 0.75)
    risk_score = signal.get('risk_score', 30)
    timestamp = signal.get('timestamp', datetime.now(timezone.utc).strftime('%H:%M'))
    
    # Card area
    card_x = 30
    card_y = 30
    card_width = width - 60
    card_height = height - 100
    
    # Draw card background with neon green border
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_width, card_y + card_height],
        radius=20,
        fill=hex_to_rgb('#0a0a0a'),
        outline=hex_to_rgb('#39FF14'),
        width=3
    )
    
    # Content positioning
    content_x = card_x + 40
    content_y = card_y + 35
    
    # === HEADER: LIVE SIGNAL ===
    draw.text((content_x, content_y), "LIVE SIGNAL", fill=hex_to_rgb('#39FF14'), font=font_header)
    content_y += 70
    
    # === MATCH NAME === (Large, white, bold)
    draw.text((content_x, content_y), match, fill=hex_to_rgb('#FFFFFF'), font=font_match)
    content_y += 65
    
    # === LEAGUE === (Gray)
    draw.text((content_x, content_y), league, fill=hex_to_rgb('#71717A'), font=font_league)
    content_y += 55
    
    # === MARKET BOX ===
    market_box_width = card_width - 80
    market_box_height = 70
    
    draw.rounded_rectangle(
        [content_x, content_y, content_x + market_box_width, content_y + market_box_height],
        radius=12,
        fill=hex_to_rgb('#111111'),
        outline=hex_to_rgb('#222222'),
        width=1
    )
    
    # Market text centered vertically
    market_y = content_y + (market_box_height - 38) // 2
    draw.text((content_x + 25, market_y), market, fill=hex_to_rgb('#39FF14'), font=font_market)
    content_y += market_box_height + 40
    
    # === CONFIDENCE & RISK SCORE ===
    section_width = (card_width - 80) // 2
    
    # Draw boxes for each metric
    metric_box_height = 140
    
    # Confidence Box
    draw.rounded_rectangle(
        [content_x, content_y, content_x + section_width - 15, content_y + metric_box_height],
        radius=12,
        fill=hex_to_rgb('#0d0d0d'),
        outline=hex_to_rgb('#1a1a1a'),
        width=1
    )
    
    # Risk Score Box
    draw.rounded_rectangle(
        [content_x + section_width + 15, content_y, content_x + section_width * 2, content_y + metric_box_height],
        radius=12,
        fill=hex_to_rgb('#0d0d0d'),
        outline=hex_to_rgb('#1a1a1a'),
        width=1
    )
    
    # Confidence content
    draw.text((content_x + 20, content_y + 15), "Confidence", fill=hex_to_rgb('#71717A'), font=font_label)
    conf_text = f"{int(confidence * 100)}"
    conf_color = get_confidence_color(confidence)
    draw.text((content_x + 20, content_y + 50), conf_text, fill=hex_to_rgb(conf_color), font=font_number)
    draw.text((content_x + 115, content_y + 70), "%", fill=hex_to_rgb(conf_color), font=font_percent)
    
    # Risk Score content
    risk_x = content_x + section_width + 35
    draw.text((risk_x, content_y + 15), "Risk Score", fill=hex_to_rgb('#71717A'), font=font_label)
    risk_text = str(risk_score)
    risk_color = get_risk_color(risk_score)
    draw.text((risk_x, content_y + 50), risk_text, fill=hex_to_rgb(risk_color), font=font_number)
    
    content_y += metric_box_height + 30
    
    # === FOOTER: Timestamp & Checkmarks ===
    draw.text((content_x, content_y), timestamp, fill=hex_to_rgb('#71717A'), font=font_footer)
    
    # "VERIFIED" on right instead of checkmarks
    verified_text = "VERIFIED"
    verified_bbox = draw.textbbox((0, 0), verified_text, font=font_footer)
    verified_x = content_x + card_width - 80 - (verified_bbox[2] - verified_bbox[0])
    draw.text((verified_x, content_y), verified_text, fill=hex_to_rgb('#00D4FF'), font=font_footer)
    
    # === BRANDING at bottom ===
    brand_text = "BETRADARMUS.DE"
    brand_bbox = draw.textbbox((0, 0), brand_text, font=font_footer)
    brand_x = (width - (brand_bbox[2] - brand_bbox[0])) // 2
    brand_y = height - 50
    draw.text((brand_x, brand_y), brand_text, fill=hex_to_rgb('#39FF14'), font=font_footer)
    
    # === DISCLAIMER line ===
    disclaimer = "Keine Wettempfehlung - Nur zu Analysezwecken"
    try:
        disc_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except Exception:
        disc_font = font_label
    disc_bbox = draw.textbbox((0, 0), disclaimer, font=disc_font)
    disc_x = (width - (disc_bbox[2] - disc_bbox[0])) // 2
    draw.text((disc_x, height - 25), disclaimer, fill=hex_to_rgb('#555555'), font=disc_font)
    
    # Save
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG', quality=95)
    img_bytes.seek(0)
    
    return img_bytes


def create_signal_image_with_logo(signal: Dict[str, Any], logo_url: Optional[str] = None) -> io.BytesIO:
    """
    Create a signal card with optional logo overlay
    """
    # For now, just use the basic version
    return create_signal_image(signal)


# Test function
if __name__ == "__main__":
    test_signal = {
        "match": "Bayern München vs Dortmund",
        "league": "Bundesliga",
        "market": "Over 2.5 Goals",
        "confidence": 0.82,
        "risk_score": 25,
        "timestamp": "14:32"
    }
    
    img_bytes = create_signal_image(test_signal)
    
    # Save test image
    with open("/tmp/test_signal.png", "wb") as f:
        f.write(img_bytes.read())
    
    print("Test image saved to /tmp/test_signal.png")
