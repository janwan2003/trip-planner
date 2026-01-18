#!/usr/bin/env python3
from PIL import Image
import os

# Load the original logo
logo = Image.open('public/logo.png')

# Convert to RGBA if not already
if logo.mode != 'RGBA':
    logo = logo.convert('RGBA')

# Get the bounding box of non-transparent pixels
bbox = logo.getbbox()

if bbox:
    # Crop to the content with minimal padding
    cropped = logo.crop(bbox)
    
    # Add very small padding (2% of size) for breathing room - even tighter crop
    width, height = cropped.size
    padding = int(max(width, height) * 0.2)
    
    # Create new image with padding
    new_size = (width + 2 * padding, height + 2 * padding)
    padded = Image.new('RGBA', new_size, (0, 0, 0, 0))
    padded.paste(cropped, (padding, padding))
    
    # Generate favicons at different sizes
    sizes = [32, 64, 96, 128, 192, 256, 512]
    
    for size in sizes:
        # Create a square canvas
        favicon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Resize the padded image to fit the canvas while maintaining aspect ratio
        padded_resized = padded.copy()
        padded_resized.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Center the resized image
        x = (size - padded_resized.width) // 2
        y = (size - padded_resized.height) // 2
        favicon.paste(padded_resized, (x, y), padded_resized)
        
        # Save
        output_path = f'public/favicon-{size}x{size}.png'
        favicon.save(output_path, 'PNG')
        print(f'Generated {output_path}')
    
    # Generate favicon.ico (combining 16, 32, 48 sizes)
    icon_sizes = [(32, 32), (64, 64)]
    icons = []
    for icon_size in icon_sizes:
        icon = Image.new('RGBA', icon_size, (0, 0, 0, 0))
        temp = padded.copy()
        temp.thumbnail(icon_size, Image.Resampling.LANCZOS)
        x = (icon_size[0] - temp.width) // 2
        y = (icon_size[1] - temp.height) // 2
        icon.paste(temp, (x, y), temp)
        icons.append(icon)
    
    icons[0].save('public/favicon.ico', format='ICO', sizes=icon_sizes)
    print('Generated public/favicon.ico')
    
    print('\nFavicons generated successfully with minimal background!')
else:
    print('Error: Could not find content in logo.png')
