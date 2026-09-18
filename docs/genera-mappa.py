"""
Schermata mappa. Le nuvole sono estratte come sprite e cancellate dal fondo:
sono gli unici elementi mobili, e se restassero dipinte se ne vedrebbero due.
Il cartiglio, vuoto nell'originale, riceve il titolo col font pixel.
"""
from PIL import Image, ImageDraw
import numpy as np, sys
from collections import deque
sys.path.insert(0, "/home/claude")
import font3x5

SRC = Image.open("/mnt/user-data/uploads/mappa-finale1.jpeg").convert("RGB")
W, H = 320, 200
base = SRC.resize((W, H), Image.BOX)
a = np.array(base).astype(int)
r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
lum = (r + g + b) / 3
grigio = np.abs(r - g) < 26                      # nuvole: bianco o grigio-azzurro

ZONE = [(0, 0, 70, 34), (0, 92, 92, 154), (238, 112, 320, 178)]

def nuvola_in(zona):
    x0, y0, x1, y1 = zona
    seme = np.zeros(lum.shape, bool)
    seme[y0:y1, x0:x1] = (lum[y0:y1, x0:x1] > 188) & grigio[y0:y1, x0:x1]
    if not seme.any():
        return None
    cresciuta = seme.copy()
    q = deque(zip(*np.where(seme)))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny, nx = y+dy, x+dx
            if not (y0 <= ny < y1 and x0 <= nx < x1):
                continue
            if cresciuta[ny, nx] or not grigio[ny, nx] or lum[ny, nx] <= 132:
                continue
            cresciuta[ny, nx] = True
            q.append((ny, nx))
    return cresciuta

nuvole, maschere = [], []
for zona in ZONE:
    m = nuvola_in(zona)
    if m is None or m.sum() < 30:
        continue
    ys, xs = np.where(m)
    bx0, bx1, by0, by1 = xs.min(), xs.max()+1, ys.min(), ys.max()+1
    rgb = a[by0:by1, bx0:bx1, :3].astype(np.uint8)
    al = (m[by0:by1, bx0:bx1] * 255).astype(np.uint8)
    nuvole.append(Image.fromarray(np.dstack([rgb, al]), "RGBA"))
    maschere.append(m)

# Riempimento: ogni pixel di nuvola prende il colore del pixel sano piu'
# vicino sulla stessa riga. Copiare da una colonna fissa lasciava striature,
# perche' il mare cambia tono anche in orizzontale.
tutte = np.zeros(lum.shape, bool)
for m in maschere:
    tutte |= m
for y in range(H):
    riga = tutte[y]
    if not riga.any():
        continue
    sani = np.where(~riga)[0]
    for x in np.where(riga)[0]:
        vicino = sani[np.argmin(np.abs(sani - x))]
        a[y, x, :3] = a[y, vicino, :3]

mappa = Image.fromarray(a.astype(np.uint8)).convert("RGBA")
d = ImageDraw.Draw(mappa)
for i, t in enumerate(["CITTA DI", "NAPOLI"]):
    tw = font3x5.larghezza(t)
    font3x5.scrivi(d, 39 - tw // 2, 166 + i * 8, t, (86, 62, 36, 255))
mappa.convert("RGB").save("/home/claude/mappa/mappa.png")

FW = max(n.width for n in nuvole)
FH = max(n.height for n in nuvole)
foglio = Image.new("RGBA", (FW * len(nuvole), FH), (0, 0, 0, 0))
for i, n in enumerate(nuvole):
    foglio.alpha_composite(n, (i * FW + (FW - n.width)//2, (FH - n.height)//2))
foglio.save("/home/claude/mappa/nuvole.png")
print("nuvole:", [n.size for n in nuvole], " foglio", foglio.size, f"celle {FW}x{FH}")
