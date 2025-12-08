# Convert SVG icons to PNGs using ImageMagick (magick)
# Run from project root (PowerShell)
# Requires: ImageMagick installed and available as `magick` in PATH

$base = Join-Path $PSScriptRoot "..\images"
Push-Location $base

$icons = @(
    @{ name='bear'; sizes=@(24,100,300)} ,
    @{ name='usec'; sizes=@(24,100,300)}
)

foreach ($icon in $icons) {
    foreach ($s in $icon.sizes) {
        $in = "$($icon.name).svg"
        if ($s -eq 300) {
            # 300x200 banner
            $out = "$($icon.name)-300x200.png"
            Write-Host "Converting $in -> $out (300x200)"
            magick convert -background none -resize 300x200 "$in" "$out"
        } else {
            $out = "$($icon.name)-${s}.png"
            Write-Host "Converting $in -> $out (${s}x${s})"
            magick convert -background none -resize ${s}x${s} "$in" "$out"
        }
    }
}

Pop-Location
Write-Host "Done. PNG files are in ./images/" -ForegroundColor Green
