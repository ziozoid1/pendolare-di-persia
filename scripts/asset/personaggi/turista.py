"""
Deriva il foglio del turista da quello del protagonista.
Il vantaggio di derivarlo invece di disegnarlo da zero: scala, allineamento
dei piedi, ampiezza delle pose e stile restano identici per costruzione.
Cambia il guardaroba, non il corpo.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np

SRC = destinazione("garibaldi2", "hero.png")
OUT = destinazione("garibaldi2", "tourist.png")
FW, FH = 32, 44
GINOCCHIO = 33          # sotto questa riga le gambe restano nude: pantaloncini

# guardaroba del turista
MAGLIA      = (218, 78, 62)     # maglietta rossa
MAGLIA_OMBRA= (162, 52, 42)
PANTALONI   = (104, 118, 84)    # pantaloncini verde oliva
PANT_OMBRA  = (74, 86, 60)
CAPPELLO    = (238, 226, 176)
CAPP_OMBRA  = (188, 172, 126)
CAPP_FASCIA = (72, 128, 96)
ZAINO       = (58, 132, 138)    # zaino turchese
ZAINO_OMBRA = (40, 96, 102)
PELLE       = (226, 170, 124)
PELLE_OMBRA = (186, 132, 92)

im = Image.open(SRC).convert("RGBA")
a = np.array(im).astype(int)
al = a[:, :, 3]
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
lum = (r + g + b) / 3
op = al > 0

# --- famiglie di colore, non colori esatti: il foglio e' rumoroso ------
bruno = op & (r - g > 10) & (g - b > 3) & (lum > 30) & (lum < 135)   # giacca
blu   = op & (b - r >= 0) & (lum > 40) & (lum < 130)                 # jeans
pelle = op & (r > 150) & (g > 95) & (g < 200) & (b < 160)
scuro = op & (lum <= 30)                                             # scarpe, contorni
chiaro = op & (lum > 150) & (np.abs(r - b) < 40)                     # camicia

out = a.copy()

def dipingi(mask, chiaro_col, scuro_col, soglia=None):
    """conserva il chiaroscuro originale: sopra la mediana il tono chiaro"""
    if not mask.any():
        return
    med = soglia if soglia is not None else np.median(lum[mask])
    for i, col in enumerate((chiaro_col, scuro_col)):
        sel = mask & ((lum >= med) if i == 0 else (lum < med))
        for c in range(3):
            out[:, :, c] = np.where(sel, col[c], out[:, :, c])

righe = np.arange(FH)[:, None] * np.ones((1, im.width), dtype=int)

# la giacca diventa maglietta; lo zaino no, quello resta zaino ma turchese.
# lo distinguo perche' sta dietro le spalle, cioe' nelle colonne a sinistra
# del centro della cella in tutte le pose rivolte a destra.
colonne = np.arange(im.width)[None, :] * np.ones((FH, 1), dtype=int)
dentro_cella = colonne % FW
# la testa non si ritocca: l'ombra della pelle cade nella stessa famiglia
# di colore della giacca, e senza questo vincolo il viso diventa rosso.
testa_zona = np.zeros_like(bruno)
for i in range(17):
    cella = op[:, i * FW:(i + 1) * FW]
    if not cella.any():
        continue
    top = np.where(cella.any(axis=1))[0].min()
    testa_zona[top:top + 8, i * FW:(i + 1) * FW] = True

zaino_zona = bruno & ~testa_zona & (dentro_cella < 13) & (righe > 10) & (righe < 30)
maglia_zona = bruno & ~zaino_zona & ~testa_zona

dipingi(zaino_zona, ZAINO, ZAINO_OMBRA)
dipingi(maglia_zona, MAGLIA, MAGLIA_OMBRA)
dipingi(blu & (righe < GINOCCHIO), PANTALONI, PANT_OMBRA)
dipingi(blu & (righe >= GINOCCHIO), PELLE, PELLE_OMBRA)
dipingi(chiaro & ~testa_zona & (righe < GINOCCHIO), PANTALONI, PANT_OMBRA)

# --- cappello e macchina fotografica, frame per frame ------------------
img = Image.fromarray(out.astype(np.uint8)).copy()
px = img.load()
for i in range(17):
    x0 = i * FW
    cella = out[:, x0:x0 + FW, 3] > 0
    if not cella.any():
        continue
    rr = np.where(cella.any(axis=1))[0]
    top = rr.min()
    # testa: le colonne occupate nelle prime 5 righe
    cc = np.where(cella[top:top + 5].any(axis=0))[0]
    hx0, hx1 = cc.min(), cc.max()
    # cupola del cappello
    for x in range(hx0, hx1 + 1):
        px[x0 + x, top] = CAPPELLO + (255,)
    # tesa, piu' larga di un pixel per lato
    for x in range(max(0, hx0 - 2), min(FW, hx1 + 3)):
        px[x0 + x, top + 2] = CAPPELLO + (255,)
        if x in (max(0, hx0 - 2), min(FW - 1, hx1 + 2)):
            px[x0 + x, top + 2] = CAPP_OMBRA + (255,)
    # fascia verde
    for x in range(hx0, hx1 + 1):
        px[x0 + x, top + 1] = CAPP_FASCIA + (255,)
    px[x0 + hx0, top] = CAPP_OMBRA + (255,)
    # macchina fotografica al collo, due righe sotto la testa
    cy = top + 9
    cx = (hx0 + hx1) // 2
    if 0 <= cy < FH - 1:
        for dx in (-1, 0, 1):
            if 0 <= cx + dx < FW and out[cy, x0 + cx + dx, 3] > 0:
                px[x0 + cx + dx, cy] = (38, 36, 40, 255)
        if 0 <= cx < FW and out[cy, x0 + cx, 3] > 0:
            px[x0 + cx, cy] = (168, 204, 214, 255)

# --- riduco la palette: il foglio di partenza ha il rumore del JPEG ----
rgb = img.convert("RGB").quantize(colors=22, method=Image.MEDIANCUT).convert("RGB")
finale = np.dstack([np.array(rgb), np.array(img)[:, :, 3]])
Image.fromarray(finale.astype(np.uint8)).save(OUT)

q = Image.open(OUT).convert("RGBA")
aq = np.array(q)
from collections import Counter
print("turista salvato:", q.size, " colori:", len(Counter(map(tuple, aq[aq[:,:,3]>0][:, :3]))))
