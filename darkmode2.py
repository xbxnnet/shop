#!/usr/bin/env python3

# Read the file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# More replacements
replacements = [
    # All labels to white/lighter
    ('<label class="block text-sm font-semibold mb-2">', '<label class="block text-sm font-semibold mb-2 text-slate-200">'),
    ('<label class="block text-sm font-semibold text-gray-700 mb-2">', '<label class="block text-sm font-semibold text-slate-200 mb-2">'),
    
    # Section backgrounds
    ('<div class="bg-slate-700 p-6 rounded-xl">', '<div class="bg-slate-700 p-6 rounded-xl">'),
    ('<div class="bg-slate-700 p-4 rounded-lg">', '<div class="bg-slate-700 p-4 rounded-lg">'),
    
    # Select dropdowns
    ('<select id="newCouponType" class="px-4 py-2 border border-slate-600 rounded-lg outline-none">', '<select id="newCouponType" class="px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white">'),
    
    # Border styles in modals
    ('<div class="border rounded-lg p-4">', '<div class="border border-slate-700 rounded-lg p-4">'),
    ('<div class="border-t mt-4 pt-4">', '<div class="border-t border-slate-700 mt-4 pt-4">'),
    ('<div class="border-t pt-2 border-t">', '<div class="border-t border-slate-700 pt-2">'),
    
    # Form labels styling fix
    ('<h3 class="font-bold text-lg mb-4">', '<h3 class="font-bold text-lg mb-4 text-white">'),
    ('<h3 class="font-bold text-lg mb-3">', '<h3 class="font-bold text-lg mb-3 text-white">'),
    
    # More input fixes
    (' class="px-4 py-2 border border-slate-600 rounded-lg outline-none" />', ' class="px-4 py-2 border border-slate-600 rounded-lg outline-none bg-slate-700 text-white" />'),
    
    # Modal headings
    ('<h2 class="text-3xl font-bold text-white">', '<h2 class="text-3xl font-bold text-white">'),
    
    # Specific admin password fix
    ('class="w-full px-4 py-3 border border-slate-600 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none" />', 'class="w-full px-4 py-3 border border-slate-600 rounded-lg mb-4 focus:ring-2 focus:ring-orange-500 outline-none bg-slate-700 text-white" />'),
    
    # Checkout form styling
    ('<form class="space-y-6">', '<form class="space-y-6">'),
    ('<div class="bg-slate-700 p-4 rounded-lg border-2 border-orange-500">', '<div class="bg-slate-700 p-4 rounded-lg border-2 border-orange-500">'),
    ('<p class="font-semibold text-white">💵 Bar bei Abholung</p>', '<p class="font-semibold text-white">💵 Bar bei Abholung</p>'),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write the file back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Dark Mode fixes complete!")
