#!/usr/bin/env python3
import re

# Read the file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Color replacements for Dark Mode
replacements = [
    # White backgrounds to slate-800
    ('bg-white', 'bg-slate-800'),
    
    # Gray text to white/slate colors
    ('text-gray-800', 'text-white'),
    ('text-gray-700', 'text-slate-300'),
    ('text-gray-600', 'text-slate-400'),
    ('text-gray-500', 'text-slate-400'),
    
    # Borders
    ('border-gray-200', 'border-slate-700'),
    ('border-gray-300', 'border-slate-600'),
    
    # Light backgrounds to dark
    ('bg-gray-50', 'bg-slate-700'),
    ('bg-gray-100', 'bg-slate-700'),
    ('bg-gray-200', 'bg-slate-600'),
    ('bg-gray-300', 'bg-slate-500'),
    
    # Indigo to orange for main theme
    ('from-indigo-600', 'from-orange-600'),
    ('to-purple-600', 'to-amber-600'),
    ('from-indigo-700', 'from-orange-700'),
    ('to-purple-700', 'to-amber-700'),
    ('text-indigo-600', 'text-orange-500'),
    ('focus:ring-indigo-500', 'focus:ring-orange-500'),
    ('text-indigo-500', 'text-orange-500'),
    ('bg-indigo-600', 'bg-orange-600'),
    ('bg-indigo-700', 'bg-orange-700'),
    ('hover:bg-indigo-700', 'hover:bg-orange-700'),
    ('focus:ring-2 focus:ring-indigo-500', 'focus:ring-2 focus:ring-orange-500'),
    
    # Green to keep but adjust
    ('focus:ring-green-500', 'focus:ring-emerald-500'),
    
    # Specific modal backgrounds
    ('bg-white rounded-2xl p-8', 'bg-slate-800 rounded-2xl p-8'),
]

# Apply replacements
for old, new in replacements:
    content = content.replace(old, new)

# Cart specific dark mode fixes
content = content.replace(
    '<div class="cart-sidebar fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end cart-overlay">\n        <div class="bg-slate-800 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">',
    '<div class="cart-sidebar fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end cart-overlay">\n        <div class="bg-slate-800 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col">'
)

content = content.replace(
    '<div class="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10 flex justify-between items-center">',
    '<div class="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10 flex justify-between items-center">'
)

content = content.replace(
    'class="text-slate-400 hover:text-slate-300 text-2xl">✕',
    'class="text-slate-400 hover:text-slate-300 text-2xl">✕'
)

content = content.replace(
    '<div class="p-6 text-center text-slate-400 flex-1">',
    '<div class="p-6 text-center text-slate-400 flex-1">'
)

content = content.replace(
    '<div class="flex items-start space-x-4 bg-slate-700 p-4 rounded-xl">',
    '<div class="flex items-start space-x-4 bg-slate-700 p-4 rounded-xl">'
)

content = content.replace(
    '<h3 class="font-semibold text-white text-sm">',
    '<h3 class="font-semibold text-white text-sm">'
)

content = content.replace(
    '<p class="text-orange-500 font-bold">',
    '<p class="text-orange-500 font-bold">'
)

content = content.replace(
    'class="bg-slate-600 p-1 rounded',
    'class="bg-slate-600 p-1 rounded'
)

content = content.replace(
    'class="flex-1 px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"',
    'class="flex-1 px-3 py-2 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"'
)

# Modal fixes - ensure all modals have dark background
content = content.replace(
    '<div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">',
    '<div class="bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">'
)

content = content.replace(
    '<h2 class="text-2xl font-bold mb-6 text-white">',
    '<h2 class="text-2xl font-bold mb-6 text-white">'
)

content = content.replace(
    '<button class="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium">',
    '<button class="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-medium">'
)

content = content.replace(
    '<button class="flex-1 bg-slate-600 text-slate-200 py-3 rounded-lg hover:bg-slate-500 font-medium">',
    '<button class="flex-1 bg-slate-600 text-slate-200 py-3 rounded-lg hover:bg-slate-500 font-medium">'
)

# Input styling in modals
content = content.replace(
    '<input id="adminPassword" type="password" value="${this.state.adminPassword}" placeholder="Passwort" class="w-full px-4 py-3 border border-slate-600 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-700 text-white"',
    '<input id="adminPassword" type="password" value="${this.state.adminPassword}" placeholder="Passwort" class="w-full px-4 py-3 border border-slate-600 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-700 text-white"'
)

# Write the file back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dark Mode conversion complete!")
