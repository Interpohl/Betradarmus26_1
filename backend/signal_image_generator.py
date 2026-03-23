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
    Create a professional signal card image - matching the reference design exactly
    
    Args:
        signal: Dictionary containing match, league, market, confidence, risk_score, timestamp
    
    Returns:
        BytesIO object containing the PNG image
    """
    
    # Image dimensions - compact like reference
    width = 700
    height = 550
    padding = 0
    card_padding = 30
    
    # Create image with dark background
    img = Image.new('RGB', (width, height), hex_to_rgb('#0a0a0a'))
    draw = ImageDraw.Draw(img)
    
    # Load fonts - MAXIMUM SIZE relative to card
    try:
        font_header = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 38)
        font_match = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
        font_league = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32)
        font_market = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
        font_label = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)
        font_number = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        font_footer = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
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
    
    # Draw main card - full width, rounded corners
    card_x = 15
    card_y = 15
    card_width = width - 30
    card_height = height - 60
    
    draw.rounded_rectangle(
        [card_x, card_y, card_x + card_width, card_y + card_height],
        radius=25,
        fill=hex_to_rgb('#111111'),
        outline=hex_to_rgb('#222222'),
        width=2
    )
    
    # Content position
    content_x = card_x + card_padding
    content_y = card_y + 25
    
    # ⚡ LIVE SIGNAL header - bright green
    draw.text((content_x, content_y), "⚡", fill=hex_to_rgb(COLORS['green']), font=font_header)
    draw.text((content_x + 42, content_y), "LIVE SIGNAL", fill=hex_to_rgb(COLORS['green']), font=font_header)
    content_y += 55
    
    # Match name - WHITE, BOLD, LARGE
    draw.text((content_x, content_y), match, fill=hex_to_rgb('#FFFFFF'), font=font_match)
    content_y += 55
    
    # League - gray
    draw.text((content_x, content_y), league, fill=hex_to_rgb('#71717A'), font=font_league)
    content_y += 45
    
    # Market box - very dark
    market_box_width = card_width - (card_padding * 2)
    market_box_height = 55
    
    draw.rounded_rectangle(
        [content_x, content_y, content_x + market_box_width, content_y + market_box_height],
        radius=8,
        fill=hex_to_rgb('#080808')
    )
    
    # Market text - GREEN
    market_y = content_y + (market_box_height - 36) // 2
    draw.text((content_x + 18, market_y), market, fill=hex_to_rgb(COLORS['green']), font=font_market)
    content_y += market_box_height + 25
    
    # Confidence & Risk Score labels
    section_width = market_box_width // 2
    draw.text((content_x, content_y), "Confidence", fill=hex_to_rgb('#71717A'), font=font_label)
    draw.text((content_x + section_width, content_y), "Risk Score", fill=hex_to_rgb('#71717A'), font=font_label)
    content_y += 35
    
    # BIG NUMBERS
    conf_text = f"{int(confidence * 100)}%"
    conf_color = get_confidence_color(confidence)
    draw.text((content_x, content_y), conf_text, fill=hex_to_rgb(conf_color), font=font_number)
    
    risk_text = str(risk_score)
    risk_color = get_risk_color(risk_score)
    draw.text((content_x + section_width, content_y), risk_text, fill=hex_to_rgb(risk_color), font=font_number)
    content_y += 75
    
    # Footer - timestamp & checkmarks
    draw.text((content_x, content_y), timestamp, fill=hex_to_rgb('#71717A'), font=font_footer)
    
    checkmark = "✓✓"
    check_bbox = draw.textbbox((0, 0), checkmark, font=font_footer)
    check_x = content_x + market_box_width - (check_bbox[2] - check_bbox[0])
    draw.text((check_x, content_y), checkmark, fill=hex_to_rgb('#00D4FF'), font=font_footer)
    
    # BETRADARMUS.DE at bottom
    brand = "BETRADARMUS.DE"
    brand_bbox = draw.textbbox((0, 0), brand, font=font_footer)
    brand_x = (width - (brand_bbox[2] - brand_bbox[0])) // 2
    draw.text((brand_x, height - 35), brand, fill=hex_to_rgb(COLORS['green']), font=font_footer)
    
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
