"""
Topo di fondale, estratto dalla griglia generata.
La griglia ha 16 riquadri: si usano la prima riga come camminata e la terza
come corsa. Il disegno e' a blocchi da circa 10 px, quindi si riduce prima
alla griglia nativa e poi di due a uno, che e' la riduzione meno
distruttiva possibile a questa taglia.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np
from collections import deque

SRC = Image.open(sorgente("griglia-topo.jpeg")).convert("RGB")
NAT = SRC.resize((128, 80), Image.BOX)          # griglia nativa: celle 32x20
a = np.array(NAT).astype(int)
r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
mask = ~((r > 140) & (b > 140) & (g < 120))     # via il magenta
NAT = Image.fromarray(np.dstack([a.astype(np.uint8), (mask * 255).astype(np.uint8)]), "RGBA")

SCELTE = [(0, c) for c in range(4)] + [(2, c) for c in range(4)]
CW, CH, FW, FH = 32, 20, 16, 10
foglio = Image.new("RGBA", (FW * 8, FH), (0, 0, 0, 0))

for i, (rr, cc) in enumerate(SCELTE):
    cell = NAT.crop((cc * CW, rr * CH, (cc + 1) * CW, (rr + 1) * CH))
    m = np.array(cell)[:, :, 3] > 0
    ys, xs = np.where(m)
    # allineo sul corpo, non sul riquadro: la coda sporge e falserebbe il centro
    colonne = m.sum(axis=0)
    corpo = np.where(colonne >= 4)[0]
    cx = int((corpo.min() + corpo.max()) / 2) if len(corpo) else cell.width // 2
    piedi = int(ys.max())
    piccola = cell.resize((CW // 2, CH // 2), Image.BOX)
    pa = np.array(piccola)
    pa[:, :, 3] = np.where(pa[:, :, 3] > 100, 255, 0)
    foglio.alpha_composite(Image.fromarray(pa), (i * FW - cx // 2 + FW // 2, FH - piedi // 2 - 1))

# frammenti isolati via, e un filo piu' scuro: il selciato e' chiaro
a = np.array(foglio)
al = a[:, :, 3] > 0
visto = np.zeros_like(al)
for i in range(8):
    x0, x1 = i * FW, (i + 1) * FW
    comps = []
    for y in range(FH):
        for x in range(x0, x1):
            if not al[y, x] or visto[y, x]:
                continue
            q, comp = deque([(y, x)]), []
            visto[y, x] = True
            while q:
                cy, cx2 = q.popleft(); comp.append((cy, cx2))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    ny, nx = cy + dy, cx2 + dx
                    if x0 <= nx < x1 and 0 <= ny < FH and al[ny, nx] and not visto[ny, nx]:
                        visto[ny, nx] = True; q.append((ny, nx))
            comps.append(comp)
    for comp in sorted(comps, key=len, reverse=True)[1:]:
        if len(comp) <= 2:
            for cy, cx2 in comp:
                a[cy, cx2, 3] = 0
m = a[:, :, 3] > 0
for c in range(3):
    a[:, :, c] = np.where(m, np.clip(a[:, :, c].astype(int) * 0.82, 0, 255), a[:, :, c])
Image.fromarray(a.astype(np.uint8)).save(destinazione("centro-direzionale", "topo.png"))
print("  topo: 8 frame da 16x10")
