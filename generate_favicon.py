#!/usr/bin/env python3
from PIL import Image

# Load the original logo
logo = Image.open('public/logo.png')

# Crop to 1200x1200 from center
width, height = logo.size
left = (width - 1200) // 2
top = (height - 1200) // 2
right = left + 1200
bottom = top + 1200
logo = logo.crop((left, top, right, bottom))

# Convert to RGBA if not already
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# Save as favicon.png (browsers will handle sizing)
logo.save('public/favicon.png', 'PNG')
print('Generated public/favicon.png')

# Generate favicon.ico from the same image
logo.save('public/favicon.ico', format='ICO')
print('Generated public/favicon.ico')

print('\nFavicon generated successfully!')
