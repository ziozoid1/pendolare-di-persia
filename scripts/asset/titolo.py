"""
Schermata iniziale: l'immagine di riferimento scalata a 320x200 (il rapporto
e' quasi identico, 1.608 contro 1.6, quindi non si taglia niente) con due
scritte ridisegnate a risoluzione di gioco, perche' ridotte diventano
illeggibili.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image, ImageDraw
import sys
import font3x5

SRC = Image.open(sorgente("titolo.jpeg")).convert("RGB")
tit = SRC.resize((320, 200), Image.BOX).convert("RGBA")
d = ImageDraw.Draw(tit)

def campiona(x0, y0, x1, y1):
    return tuple(tit.crop((x0, y0, x1, y1)).resize((1, 1), Image.BOX).getpixel((0, 0)))

# --- insegna TECNU-CARE appesa tra le torri ---------------------------
testo = "TECNU-CARE"
SW = font3x5.larghezza(testo) + 10
SX, SY = (320 - SW) // 2, 62
cielo = campiona(120, 58, 140, 60)
d.rectangle([SX - 2, SY - 2, SX + SW + 1, SY + 10], fill=cielo)       # pulisco
d.rectangle([SX, SY, SX + SW, SY + 8], fill=(214, 216, 222, 255))
d.rectangle([SX + 1, SY + 1, SX + SW - 1, SY + 7], fill=(52, 92, 140, 255))
font3x5.scrivi(d, SX + 5, SY + 2, testo, (244, 246, 250, 255))
for cx in (SX + 5, SX + SW - 6):                                      # catenelle
    d.line([cx, SY - 4, cx, SY], fill=(96, 98, 104, 255))

# --- cartellino PAZIENZA sopra l'orologio -----------------------------
pz = "PAZIENZA"
PW = font3x5.larghezza(pz) + 8
PX, PY = (320 - PW) // 2, 88
d.rectangle([PX, PY, PX + PW, PY + 8], fill=(232, 226, 196, 255))
d.rectangle([PX, PY, PX + PW, PY], fill=(180, 172, 140, 255))
font3x5.scrivi(d, PX + 4, PY + 2, pz, (62, 52, 40, 255))

tit.convert("RGB").save(destinazione("garibaldi2", "titolo.png"))
print("titolo salvato 320x200")
