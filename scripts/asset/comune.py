"""
Percorsi condivisi dagli script che generano gli asset.
Le immagini di partenza stanno in assets-sorgente/, i PNG finiti vanno
direttamente in public/skins/: non c'e' nessun passaggio manuale.
"""
import os, sys

RADICE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SORGENTI = os.path.join(RADICE, "assets-sorgente")
SKINS = os.path.join(RADICE, "public", "skins")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def sorgente(nome):
    p = os.path.join(SORGENTI, nome)
    if not os.path.exists(p):
        raise SystemExit(f"Immagine sorgente mancante: {p}")
    return p

def destinazione(skin, file):
    cart = os.path.join(SKINS, skin)
    os.makedirs(cart, exist_ok=True)
    return os.path.join(cart, file)
