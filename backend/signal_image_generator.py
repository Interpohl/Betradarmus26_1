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
    Create a professional signal card image
    
    Args:
        signal: Dictionary containing match, league, market, confidence, risk_score, timestamp
    
    Returns:
        BytesIO object containing the PNG image
    """
    
    # Image dimensions - EXTRA LARGE for maximum readability
    width = 1200
    height = 750
    padding = 50
    card_padding = 50
    
    # Create image with dark background
    img = Image.new('RGB', (width, height), hex_to_rgb(COLORS['background']))
    draw = ImageDraw.Draw(img)
    
    # Try to load fonts - EXTRA LARGE sizes
    try:
        font_header = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
        font_match = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_league = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_market = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_number = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 85)
        font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except Exception:
        font_header = ImageFont.load_default()
        font_match = ImageFont.load_default()
        font_league = ImageFont.load_default()
        font_market = ImageFont.load_default()
        font_label = ImageFont.load_default()
        font_number = ImageFont.load_default()
        font_footer = ImageFont.load_default()
    
    # Extract signal data
    match = signal.get('match', 'Team A vs Team B')
    league = signal.get('league', 'League')
    market = signal.get('market', 'Market')
    confidence = signal.get('confidence', 0.75)
    risk_score = signal.get('risk_score', 30)
    timestamp = signal.get('timestamp', datetime.now(timezone.utc).strftime('%H:%M'))
    
    # Card dimensions
    card_x = padding
    card_y = padding
    card_width = width - (padding * 2)
    card_height = height - (padding * 2)
    card_radius = 30
    
    # Draw main card background with rounded corners and green border
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_width, card_y + card_height],
        radius=card_radius,
        fill=hex_to_rgb(COLORS['card_bg']),
        outline=hex_to_rgb(COLORS['green']),
        width=4
    )
    
    # Content starting position
    content_x = card_x + card_padding
    content_y = card_y + card_padding
    
    # Draw "LIVE SIGNAL" header
    header_text = "⚡ LIVE SIGNAL"
    draw.text((content_x, content_y), header_text, fill=hex_to_rgb(COLORS['green']), font=font_header)
    
    content_y += 70
    
    # Draw match name - EXTRA LARGE
    draw.text((content_x, content_y), match, fill=hex_to_rgb(COLORS['white']), font=font_match)
    content_y += 70
    
    # Draw league
    draw.text((content_x, content_y), league, fill=hex_to_rgb(COLORS['gray']), font=font_league)
    content_y += 55
    
    # Draw market box
    market_box_x = content_x
    market_box_y = content_y
    market_box_width = card_width - (card_padding * 2)
    market_box_height = 80
    
    draw.rounded_rectangle(
        [market_box_x, market_box_y, market_box_x + market_box_width, market_box_y + market_box_height],
        radius=15,
        fill=hex_to_rgb(COLORS['market_bg']),
        outline=hex_to_rgb(COLORS['card_border']),
        width=2
    )
    
    # Draw market text in box - centered vertically
    market_text_y = market_box_y + (market_box_height - 38) // 2
    draw.text((market_box_x + 30, market_text_y), market, fill=hex_to_rgb(COLORS['green']), font=font_market)
    
    content_y += market_box_height + 45
    
    # Draw Confidence and Risk Score section
    section_width = (card_width - (card_padding * 2)) // 2
    
    # Confidence label
    draw.text((content_x, content_y), "Confidence", fill=hex_to_rgb(COLORS['gray']), font=font_label)
    # Risk Score label
    draw.text((content_x + section_width, content_y), "Risk Score", fill=hex_to_rgb(COLORS['gray']), font=font_label)
    
    content_y += 50
    
    # Confidence value - HUGE
    conf_text = f"{int(confidence * 100)}%"
    conf_color = get_confidence_color(confidence)
    draw.text((content_x, content_y), conf_text, fill=hex_to_rgb(conf_color), font=font_number)
    
    # Risk Score value - HUGE
    risk_text = str(risk_score)
    risk_color = get_risk_color(risk_score)
    draw.text((content_x + section_width, content_y), risk_text, fill=hex_to_rgb(risk_color), font=font_number)
    
    content_y += 110
    
    # Draw timestamp at bottom left
    draw.text((content_x, content_y), f"⏰ {timestamp}", fill=hex_to_rgb(COLORS['gray']), font=font_footer)
    
    # Draw checkmark at bottom right
    checkmark = "✓✓"
    checkmark_bbox = draw.textbbox((0, 0), checkmark, font=font_footer)
    checkmark_x = card_x + card_width - card_padding - (checkmark_bbox[2] - checkmark_bbox[0])
    draw.text((checkmark_x, content_y), checkmark, fill=hex_to_rgb(COLORS['cyan']), font=font_footer)
    
    # Draw BETRADARMUS branding at very bottom center
    brand_text = "BETRADARMUS.DE"
    brand_bbox = draw.textbbox((0, 0), brand_text, font=font_footer)
    brand_x = (width - (brand_bbox[2] - brand_bbox[0])) // 2
    brand_y = height - padding + 10
    draw.text((brand_x, brand_y), brand_text, fill=hex_to_rgb(COLORS['green']), font=font_footer)
    
    # Save to BytesIO
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
