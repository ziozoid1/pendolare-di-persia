"""
Stage 3 — facciata della Torre Saverio dall'immagine di riferimento.

Correzione necessaria: nell'originale il pavimento comincia a y=718 su 816,
cioe' all'88% dell'altezza, mentre il gioco appoggia i piedi al 84%
(GROUND_Y=168 su 200). Scalando e basta il personaggio galleggerebbe di 8 px.
Quindi alzo l'immagine di 8 px e prolungo il pavimento in basso.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image, ImageDraw
import numpy as np
import sys
import font3x5

SRC = Image.open(sorgente("ascensori-facciata.jpeg")).convert("RGB")
SKIN = "torre-ascensori"
N = Image.NEAREST
W, H, SUOLO = 320, 200, 168
PAV_SRC = 718                 # dove inizia il pavimento nell'originale

scala = Image.BOX
piano = SRC.resize((W, H), scala)
pav_y = round(PAV_SRC * H / SRC.height)
delta = pav_y - SUOLO
print("pavimento scalato a y =", pav_y, " scarto da correggere:", delta)

img = Image.new("RGB", (W, H))
img.paste(piano.crop((0, delta, W, H)), (0, 0))
# prolungo il pavimento: ripeto le ultime righe, che sono selciato
coda = piano.crop((0, H - delta - 2, W, H - 2))
img.paste(coda.resize((W, delta), N), (0, H - delta))
# --- insegne, scritte a risoluzione di gioco col font pixel -----------
d = ImageDraw.Draw(img)

# Insegna dell'edificio, sulla fascia di cemento in alto a sinistra
nome = "TORRE SAVERIO"
NW = font3x5.larghezza(nome) + 16
NX, NY = 26, 18
d.rectangle([NX, NY, NX + NW, NY + 15], fill=(38, 42, 48))
d.rectangle([NX, NY, NX + NW, NY + 1], fill=(96, 102, 110))
d.rectangle([NX, NY + 14, NX + NW, NY + 15], fill=(22, 24, 28))
font3x5.scrivi(d, NX + 8, NY + 5, nome, (222, 226, 230, 255))
for bx in (NX + 6, NX + NW - 8):                    # staffe di fissaggio
    d.rectangle([bx, NY + 15, bx + 2, NY + 18], fill=(82, 88, 96))

# Cartello GUASTO sul vano di sinistra, quello senza cabina
g = "GUASTO"
GW = font3x5.larghezza(g) + 12
GX, GY = 193 - GW // 2, 112
d.rectangle([GX, GY, GX + GW, GY + 13], fill=(228, 196, 72))
d.rectangle([GX, GY, GX + GW, GY + 1], fill=(246, 222, 130))
d.rectangle([GX, GY + 12, GX + GW, GY + 13], fill=(174, 144, 40))
font3x5.scrivi(d, GX + 6, GY + 4, g, (46, 38, 20, 255))
for tx in (GX + 1, GX + GW - 4):                    # nastro agli angoli
    d.rectangle([tx, GY - 2, tx + 3, GY + 1], fill=(206, 206, 198))

img.save(destinazione(SKIN, "ascensori.png"))

# centri dei vani e corsa verticale, ricalcolati sull'immagine finale
a = np.asarray(img).astype(int)
scuro = (a[:100].mean(axis=2) < 70).mean(axis=0)
vani, s = [], None
for x in range(W):
    if scuro[x] > 0.7 and s is None: s = x
    elif scuro[x] <= 0.7 and s is not None:
        if x - s > 5: vani.append((s + x) // 2)
        s = None
if s is not None and W - s > 5: vani.append((s + W) // 2)

# fondo dei vani: prima riga in cui la colonna centrale non e' piu' scura
centro = vani[1] if len(vani) > 1 else vani[0]
col = a[:, centro].mean(axis=1)
fondo = next((y for y in range(SUOLO) if col[y] > 90), SUOLO)
print("centri dei vani x =", vani)
print("fondo dei vani y =", fondo, " -> corsa da 0 a", fondo - 24)
