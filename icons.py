#!/usr/bin/env python3

# Read the file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Icon replacements - Emojis zu Font Awesome
replacements = [
    # Header/Navigation Icons
    ('🛍️', '<i class="fas fa-shopping-bag"></i>'),
    ('🛒', '<i class="fas fa-shopping-cart"></i>'),
    ('🔐', '<i class="fas fa-lock"></i>'),
    ('👤', '<i class="fas fa-user"></i>'),
    ('📦', '<i class="fas fa-cube"></i>'),
    ('🔒', '<i class="fas fa-lock-alt"></i>'),
    ('✏️', '<i class="fas fa-edit"></i>'),
    ('🗑️', '<i class="fas fa-trash"></i>'),
    ('📋', '<i class="fas fa-list"></i>'),
    ('🎟️', '<i class="fas fa-ticket-alt"></i>'),
    ('💳', '<i class="fas fa-credit-card"></i>'),
    ('✓', '<i class="fas fa-check"></i>'),
    ('✕', '<i class="fas fa-times"></i>'),
    ('❌', '<i class="fas fa-times-circle"></i>'),
    ('✅', '<i class="fas fa-check-circle"></i>'),
    ('⏳', '<i class="fas fa-hourglass"></i>'),
    ('➕', '<i class="fas fa-plus"></i>'),
    ('➖', '<i class="fas fa-minus"></i>'),
    ('💾', '<i class="fas fa-save"></i>'),
    ('💵', '<i class="fas fa-money-bill"></i>'),
    ('📍', '<i class="fas fa-map-marker-alt"></i>'),
    ('🌍', '<i class="fas fa-globe"></i>'),
    ('📱', '<i class="fas fa-mobile-alt"></i>'),
    
    # Social Media - Real Logos (using Font Awesome brands)
    ('📷', '<i class="fab fa-instagram"></i>'),
    ('🎵', '<i class="fab fa-tiktok"></i>'),
    ('▶', '<i class="fab fa-youtube"></i>'),
    ('✉', '<i class="fas fa-envelope"></i>'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write the file back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Font Awesome icon conversion complete!")
