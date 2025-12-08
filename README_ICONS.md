# Icons for Tarkov Stats Extension

This folder contains original, lightweight vector icons created for the extension.

Files added:
- `images/bear.svg` — stylized BEAR icon (SVG)
- `images/usec.svg` — stylized USEC icon (SVG)
- `scripts/convert_svgs.ps1` — PowerShell script to generate PNGs using ImageMagick

Why SVG?
- Scalable and small. You can convert to PNG at any size.

How to create PNGs (recommended)
1. Install ImageMagick (Windows): https://imagemagick.org/script/download.php#windows
2. Open PowerShell in the project root and run:

```powershell
# from project root
.\scripts\convert_svgs.ps1
```

What the script generates
- `images/bear-24.png`  (24x24)
- `images/bear-100.png` (100x100)
- `images/bear-300x200.png` (300x200)
- `images/usec-24.png`
- `images/usec-100.png`
- `images/usec-300x200.png`

If ImageMagick is not available
- You can open the SVG files in any vector editor (Inkscape, Illustrator) and export the PNG sizes.

Design notes
- These SVGs are original, simplified icons inspired by faction motifs. They are safe to use as extension assets (created for the project).

If you want
- I can rasterize them here if you allow me to install or use an available image tool, or I can generate PNG data URIs instead. Tell me which path you prefer.
