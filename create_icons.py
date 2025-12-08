"""
Twitch Extension Icon Generator
Converts BEAR and USEC icons to required sizes for Twitch Extension
"""

from PIL import Image
import os

# Extension icon sizes required by Twitch
SIZES = {
    'small': (24, 24),
    'medium': (100, 100),
    'large': (300, 200)
}

def create_extension_icon(bear_path, usec_path, output_dir='images'):
    """Create composite extension icon with both factions"""
    
    # Load images
    bear = Image.open(bear_path).convert('RGBA')
    usec = Image.open(usec_path).convert('RGBA')
    
    for size_name, (width, height) in SIZES.items():
        print(f"\n📐 Creating {size_name} icon ({width}x{height})...")
        
        # Create new image with dark background (Tarkov theme)
        icon = Image.new('RGBA', (width, height), (26, 26, 26, 255))
        
        if size_name == 'large':
            # For 300x200, put both factions side by side
            half_width = width // 2
            
            # Resize BEAR (left side)
            bear_resized = bear.resize((half_width - 20, height - 40), Image.Resampling.LANCZOS)
            bear_x = 10
            bear_y = (height - bear_resized.height) // 2
            icon.paste(bear_resized, (bear_x, bear_y), bear_resized)
            
            # Resize USEC (right side)
            usec_resized = usec.resize((half_width - 20, height - 40), Image.Resampling.LANCZOS)
            usec_x = half_width + 10
            usec_y = (height - usec_resized.height) // 2
            icon.paste(usec_resized, (usec_x, usec_y), usec_resized)
            
        else:
            # For 24x24 and 100x100, use BEAR logo centered (more recognizable)
            size = min(width, height) - 8
            bear_resized = bear.resize((size, size), Image.Resampling.LANCZOS)
            x = (width - bear_resized.width) // 2
            y = (height - bear_resized.height) // 2
            icon.paste(bear_resized, (x, y), bear_resized)
        
        # Save icon
        output_path = os.path.join(output_dir, f'icon-{width}x{height}.png')
        icon.save(output_path, 'PNG', optimize=True)
        print(f"✅ Saved: {output_path}")
    
    # Also create individual faction icons in standard sizes
    print("\n🎨 Creating individual faction icons...")
    for faction, img in [('bear', bear), ('usec', usec)]:
        for size in [32, 64, 128]:
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            output_path = os.path.join(output_dir, f'{faction}-{size}.png')
            resized.save(output_path, 'PNG', optimize=True)
            print(f"✅ Saved: {output_path}")

if __name__ == '__main__':
    print("🎮 Twitch Extension Icon Generator")
    print("=" * 50)
    
    # Check if source images exist
    bear_path = 'images/bear-original.png'
    usec_path = 'images/usec-original.png'
    
    if not os.path.exists(bear_path):
        print(f"❌ Error: {bear_path} not found!")
        exit(1)
    
    if not os.path.exists(usec_path):
        print(f"❌ Error: {usec_path} not found!")
        exit(1)
    
    # Create icons
    create_extension_icon(bear_path, usec_path)
    
    print("\n" + "=" * 50)
    print("✅ All icons created successfully!")
    print("\n📋 Twitch Extension Requirements:")
    print("   ✅ icon-24x24.png   - Small icon (menu)")
    print("   ✅ icon-100x100.png - Medium icon (discovery)")
    print("   ✅ icon-300x200.png - Large banner (discovery page)")
    print("\n💡 Next: Upload these to Twitch Developer Console!")
