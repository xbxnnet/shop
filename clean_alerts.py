#!/usr/bin/env python3

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all alert icons with clean messages
replacements = [
    ("alert('<i class=\"fas fa-check-circle\"></i> Produkt zum Warenkorb hinzugefügt!');", "alert('✓ Produkt zum Warenkorb hinzugefügt!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Produkt gespeichert!');", "alert('✓ Produkt gespeichert!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Produkt gelöscht!');", "alert('✓ Produkt gelöscht!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Standort freigeschaltet!');", "alert('✓ Standort freigeschaltet!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Gutschein angewendet!');", "alert('✓ Gutschein angewendet!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Bestellung angenommen!');", "alert('✓ Bestellung angenommen!');"),
    ("alert('<i class=\"fas fa-check-circle\"></i> Bestellung erfolgreich!');", "alert('✓ Bestellung erfolgreich!');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Bitte füllen Sie alle Felder aus');", "alert('✗ Bitte füllen Sie alle Felder aus');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Name und Preis sind erforderlich');", "alert('✗ Name und Preis sind erforderlich');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Falsches Passwort');", "alert('✗ Falsches Passwort');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Ungültiger Kundencode');", "alert('✗ Ungültiger Kundencode');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Ungültiger Gutscheincode');", "alert('✗ Ungültiger Gutscheincode');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Bestellung abgelehnt');", "alert('✗ Bestellung abgelehnt');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Fehler beim Senden');", "alert('✗ Fehler beim Senden');"),
    ("alert('<i class=\"fas fa-times-circle\"></i> Netzwerkfehler');", "alert('✗ Netzwerkfehler');"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Alerts cleaned!")
