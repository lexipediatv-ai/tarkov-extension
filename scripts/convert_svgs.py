#!/usr/bin/env python3
"""
Create PNG icons for BEAR and USEC factions.
Simple rasterized versions using PIL/Pillow only (no SVG parser needed).
Requires: pip install pillow
"""
import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("ERROR: Pillow not installed.")
    print("Run: python -m pip install pillow")
    exit(1)

def create_bear_icon(width, height):
    """Create BEAR icon as PNG."""
    img = Image.new('RGBA', (width, height), (13, 23, 15, 255))
    draw = ImageDraw.Draw(img)
    
    # Scale factor for different sizes
    scale = min(width, height) / 100
    
    # Bear head (dark green/brown ellipse)
    cx, cy = width // 2, height // 2
    rx, ry = int(28 * scale), int(26 * scale)
    draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=(43, 43, 43, 255))
    
    # Ears
    ear_r = int(8 * scale)
    draw.ellipse([cx-int(16*scale)-ear_r, cy-int(18*scale)-ear_r, 
                  cx-int(16*scale)+ear_r, cy-int(18*scale)+ear_r], fill=(15, 15, 15, 255))
    draw.ellipse([cx+int(16*scale)-ear_r, cy-int(18*scale)-ear_r, 
                  cx+int(16*scale)+ear_r, cy-int(18*scale)+ear_r], fill=(15, 15, 15, 255))
    
    # Muzzle
    muzzle_rx, muzzle_ry = int(12 * scale), int(8 * scale)
    draw.ellipse([cx-muzzle_rx, cy+int(10*scale)-muzzle_ry, 
                  cx+muzzle_rx, cy+int(10*scale)+muzzle_ry], fill=(201, 191, 179, 255))
    
    # Nose
    nose_r = int(2.2 * scale)
    draw.ellipse([cx-nose_r, cy+int(10*scale)-nose_r, 
                  cx+nose_r, cy+int(10*scale)+nose_r], fill=(33, 31, 31, 255))
    
    # Eyes
    eye_w, eye_h = int(4 * scale), int(6 * scale)
    draw.rectangle([cx-int(8*scale)-eye_w//2, cy-int(2*scale)-eye_h//2, 
                    cx-int(8*scale)+eye_w//2, cy-int(2*scale)+eye_h//2], fill=(6, 6, 6, 255))
    draw.rectangle([cx+int(8*scale)-eye_w//2, cy-int(2*scale)-eye_h//2, 
                    cx+int(8*scale)+eye_w//2, cy-int(2*scale)+eye_h//2], fill=(6, 6, 6, 255))
    
    return img

def create_usec_icon(width, height):
    """Create USEC icon as PNG."""
    img = Image.new('RGBA', (width, height), (7, 18, 26, 255))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    scale = min(width, height) / 100
    
    # Shield shape (simplified polygon)
    cx, cy = width // 2, height // 2
    top_y = cy - int(32 * scale)
    bottom_y = cy + int(32 * scale)
    left_x = cx - int(28 * scale)
    right_x = cx + int(28 * scale)
    
    shield_points = [
        (cx, top_y),
        (right_x, top_y + int(16 * scale)),
        (right_x, bottom_y - int(18 * scale)),
        (cx, bottom_y),
        (left_x, bottom_y - int(18 * scale)),
        (left_x, top_y + int(16 * scale))
    ]
    draw.polygon(shield_points, fill=(18, 62, 86, 255), outline=(7, 39, 51, 255))
    
    # Horizontal bars (simplified eagle/wing design)
    bar_w = int(32 * scale)
    bar_h = int(4 * scale)
    bar_color = (243, 243, 242, 255)
    
    draw.rectangle([cx - bar_w//2, cy - int(14*scale), cx + bar_w//2, cy - int(14*scale) + bar_h], fill=bar_color)
    draw.rectangle([cx - int(28*scale)//2, cy - int(6*scale), cx + int(28*scale)//2, cy - int(6*scale) + bar_h], fill=bar_color)
    draw.rectangle([cx - int(24*scale)//2, cy + int(2*scale), cx + int(24*scale)//2, cy + int(2*scale) + bar_h], fill=bar_color)
    
    # Chevron accent (triangle at top)
    chevron_points = [
        (cx, top_y + int(12 * scale)),
        (cx + int(10 * scale), top_y + int(22 * scale)),
        (cx - int(10 * scale), top_y + int(22 * scale))
    ]
    draw.polygon(chevron_points, fill=(219, 238, 246, 255))
    
    return img

def main():
    # Get images directory
    script_dir = Path(__file__).parent
    images_dir = script_dir.parent / 'images'
    
    if not images_dir.exists():
        print(f"ERROR: Images directory not found: {images_dir}")
        exit(1)
    
    icons = [
        {'name': 'bear', 'func': create_bear_icon, 'sizes': [(24, 24), (100, 100), (300, 200)]},
        {'name': 'usec', 'func': create_usec_icon, 'sizes': [(24, 24), (100, 100), (300, 200)]}
    ]
    
    for icon in icons:
        for width, height in icon['sizes']:
            if width == 300 and height == 200:
                png_file = images_dir / f"{icon['name']}-300x200.png"
            else:
                png_file = images_dir / f"{icon['name']}-{width}.png"
            
            print(f"Creating {icon['name']} icon -> {png_file.name} ({width}x{height})")
            
            try:
                img = icon['func'](width, height)
                img.save(png_file, 'PNG')
                print(f"  ✅ Saved {png_file.name}")
            except Exception as e:
                print(f"  ❌ ERROR: {e}")
    
    print("\n🎉 Done! PNG icons created in ./images/")
    print("\nFiles created:")
    for icon in icons:
        for width, height in icon['sizes']:
            if width == 300 and height == 200:
                fname = f"{icon['name']}-300x200.png"
            else:
                fname = f"{icon['name']}-{width}.png"
            print(f"  • images/{fname}")

if __name__ == '__main__':
    main()
