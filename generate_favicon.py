#!/usr/bin/env python3
from PIL import Image

def remove_white_background(image):
    """Remove white/light background and make it transparent"""
    image = image.convert("RGBA")
    data = image.getdata()
    
    new_data = []
    for item in data:
        # If pixel is very light (close to white), make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))  # Fully transparent
        else:
            new_data.append(item)
    
    image.putdata(new_data)
    return image

# Load the original logo
logo = Image.open('public/logo.png')

# Remove white background first
logo = remove_white_background(logo)

# Crop to 1200x1200 from center
width, height = logo.size
left = (width - 1200) // 2
top = (height - 1200) // 2
right = left + 1200
bottom = top + 1200
logo = logo.crop((left, top, right, bottom))

# Save as favicon.png with transparency
logo.save('public/favicon.png', 'PNG')
print('Generated public/favicon.png')

# Generate favicon.ico
logo.save('public/favicon.ico', format='ICO')
print('Generated public/favicon.ico')

print('\nFavicon generated successfully with transparent background!')
