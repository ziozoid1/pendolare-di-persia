"""
Deriva il foglio del ladro da quello del protagonista.
Oltre al cambio di guardaroba serve un cambio di silhouette: il cappuccio,
che nasconde la testa calva e la barba e rende il personaggio riconoscibile
a colpo d'occhio anche di spalle.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np

SRC = destinazione("garibaldi2", "hero.png")
OUT = destinazione("garibaldi2", "thief.png")
FW, FH = 32, 44

FELPA        = (112, 118, 132)  # felpa grigio-ardesia, chiara per leggibilita'
FELPA_OMBRA  = (72, 78, 92)
PANT         = (44, 44, 52)     # pantaloni scuri
PANT_OMBRA   = (28, 28, 34)
BORSA        = (64, 60, 58)     # la refurtiva sulle spalle
BORSA_OMBRA  = (42, 40, 38)
CAPPUCCIO    = (96, 102, 116)
CAPP_OMBRA   = (60, 66, 78)
VOLTO_OMBRA  = (34, 30, 30)
PELLE        = (196, 148, 108)

# Quantizzo il foglio di partenza PRIMA di ricolorare: farlo dopo sposta i
# colori scelti verso quelli piu' frequenti, e il grigio ardesia diventava
# marrone. Cosi' la palette e' limitata e i colori finali sono esatti.
im = Image.open(SRC).convert("RGBA")
_q = im.convert("RGB").quantize(colors=20, method=Image.MEDIANCUT).convert("RGB")
a = np.dstack([np.array(_q), np.array(im)[:, :, 3]]).astype(int)
al = a[:, :, 3]
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
lum = (r + g + b) / 3
op = al > 0

bruno  = op & (r - g > 10) & (g - b > 3) & (lum > 30) & (lum < 135)
blu    = op & (b - r >= 0) & (lum > 40) & (lum < 130)
chiaro = op & (lum > 150) & (np.abs(r - b) < 40)
pelle  = op & (r > 150) & (g > 95) & (g < 200) & (b < 160)

righe = np.arange(FH)[:, None] * np.ones((1, im.width), dtype=int)
colonne = np.arange(im.width)[None, :] * np.ones((FH, 1), dtype=int)
dentro = colonne % FW

# la testa: prime 8 righe di ogni figura. Qui va il cappuccio.
testa = np.zeros_like(op)
cime = {}
for i in range(17):
    cella = op[:, i * FW:(i + 1) * FW]
    if not cella.any():
        continue
    top = int(np.where(cella.any(axis=1))[0].min())
    cime[i] = top
    testa[top:top + 9, i * FW:(i + 1) * FW] = True

out = a.copy()

def dipingi(mask, chiaro_col, scuro_col):
    if not mask.any():
        return
    med = np.median(lum[mask])
    for i, col in enumerate((chiaro_col, scuro_col)):
        sel = mask & ((lum >= med) if i == 0 else (lum < med))
        for c in range(3):
            out[:, :, c] = np.where(sel, col[c], out[:, :, c])

borsa_zona = bruno & ~testa & (dentro < 13) & (righe > 10) & (righe < 30)
dipingi(borsa_zona, BORSA, BORSA_OMBRA)
dipingi(bruno & ~testa & ~borsa_zona, FELPA, FELPA_OMBRA)
dipingi(chiaro & ~testa, FELPA, FELPA_OMBRA)
dipingi(blu, PANT, PANT_OMBRA)
# le mani restano visibili: servono nella posa in cui allunga il braccio
mani = pelle & (righe > 16)
for c in range(3):
    out[:, :, c] = np.where(mani, PELLE[c], out[:, :, c])

img = Image.fromarray(out.astype(np.uint8)).copy()
px = img.load()

for i, top in cime.items():
    x0 = i * FW
    cella = op[:, x0:x0 + FW]
    # larghezza della testa presa dalle sole righe alte: alle righe basse
    # ci sono già le spalle, e includerle rende il cappuccio un blocco.
    cc = np.where(cella[top:top + 4].any(axis=0))[0]
    if len(cc) == 0:
        continue
    hsx, hdx = int(cc.min()), int(cc.max())

    for y in range(top, top + 7):
        stretta = 1 if y == top else 0        # cupola rastremata in cima
        for x in range(hsx + stretta, hdx + 1 - stretta):
            if al[y, x0 + x] == 0:
                continue
            anteriore = x >= hdx - 2
            if y >= top + 3 and anteriore:
                px[x0 + x, y] = VOLTO_OMBRA + (255,)      # volto in ombra
            elif x == hsx + stretta or y == top + 6:
                px[x0 + x, y] = CAPP_OMBRA + (255,)       # bordo del cappuccio
            else:
                px[x0 + x, y] = CAPPUCCIO + (255,)
    # occhio: un pixel chiaro da' la direzione dello sguardo
    if top + 4 < FH and al[top + 4, x0 + hdx - 1] > 0:
        px[x0 + hdx - 1, top + 4] = (186, 176, 168, 255)
    # mento appena illuminato, cosi' il volto non e' un buco nero
    if top + 6 < FH and al[top + 6, x0 + hdx] > 0:
        px[x0 + hdx, top + 6] = (128, 100, 80, 255)
    # punta del cappuccio dietro la nuca
    if hsx - 1 >= 0:
        for y in (top + 2, top + 3):
            px[x0 + hsx - 1, y] = CAPP_OMBRA + (255,)

img.save(OUT)
from collections import Counter
_a = np.array(Image.open(OUT).convert("RGBA"))
print("colori:", len(Counter(map(tuple, _a[_a[:, :, 3] > 0][:, :3]))))
print("ladro salvato")
