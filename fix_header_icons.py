#!/usr/bin/env python3

# Read the file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix remaining emoji icons that might still be in the file
# Admin buttons in header
content = content.replace(
    '<span>⚙</span>',
    '<i class="fas fa-cog"></i>'
)

content = content.replace(
    '<span>🎟</span>',
    '<i class="fas fa-ticket-alt"></i>'
)

content = content.replace(
    '<span>📊</span>',
    '<i class="fas fa-chart-bar"></i>'
)

# Bomb icon for logo - keep as special case or use icon
content = content.replace(
    '<div class="text-3xl">💣</div>',
    '<div class="text-3xl"><i class="fas fa-fire" style="color: #ff6b35;"></i></div>'
)

# Write back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Header button icons fixed!")
