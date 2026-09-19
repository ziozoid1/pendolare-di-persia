import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np
from collections import deque

SRC = Image.open(sorgente("griglia-seller.jpeg")).convert("RGB")
A = np.asarray(SRC).astype(int)
K = SRC.width / 1030.0                      # l'immagine replica il mio riferimento, scalato
CW, CH = round(160 * K), round(220 * K)
X0, Y0 = 10 * K, 40 * K
DX, DY = 170 * K, 260 * K
FW, FH, FEET_Y = 32, 44, 42

def chiave(cell, togli_grigio):
    r, g, b = cell[:,:,0], cell[:,:,1], cell[:,:,2]
    lum = (r + g + b) / 3
    fuori = (g < 60) & (r - g > 45) & (b - g > 25)          # magenta di fondo
    fuori |= (g - r > 14) & (g - b > 14) & (lum < 150)       # linea verde del suolo
    if togli_grigio:
        # nel riquadro "push" il disegno ha aggiunto una figura grigia di
        # sfondo che non c'entra: e' l'unico grigio medio desaturato presente
        fuori |= (np.abs(r - g) < 20) & (np.abs(g - b) < 22) & (lum > 55) & (lum < 165)
    return ~fuori

frames, alt = [], []
for i in range(17):
    c, rr = i % 6, i // 6
    x0, y0 = round(X0 + c * DX), round(Y0 + rr * DY)
    cell = A[y0:y0 + CH, x0:x0 + CW]
    m = chiave(cell, togli_grigio=(i == 14))
    m[:6, :] = False; m[-4:, :] = False; m[:, :5] = False; m[:, -5:] = False
    rs = np.where(m.sum(axis=1) >= 5)[0]
    cs = np.where(m.sum(axis=0) >= 5)[0]
    if len(rs) == 0:
        frames.append(None); alt.append(0); continue
    m[:rs.min(), :] = False; m[rs.max()+1:, :] = False
    m[:, :cs.min()] = False; m[:, cs.max()+1:] = False
    rgba = np.dstack([cell.astype(np.uint8), (m * 255).astype(np.uint8)])
    frames.append({"img": Image.fromarray(rgba, "RGBA"),
                   "bbox": (int(cs.min()), int(rs.min()), int(cs.max())+1, int(rs.max())+1)})
    alt.append(int(rs.max() - rs.min()))

print("altezze:", alt)
normali = [alt[i] for i in range(17) if i not in (10, 11, 12, 13)]
print("altezze in piedi: min", min(normali), "max", max(normali),
      f"variazione {100*(max(normali)/min(normali)-1):.0f}%")

k = 40 / alt[0]
sheet = Image.new("RGBA", (FW*17, FH), (0,0,0,0))
for i, f in enumerate(frames):
    if f is None: continue
    x0, y0, x1, y1 = f["bbox"]
    fig = f["img"].crop((x0, y0, x1, y1))
    nw, nh = max(1, round((x1-x0)*k)), max(1, round((y1-y0)*k))
    fig = fig.resize((nw, nh), Image.BOX)
    testa = np.array(fig)[:max(1, nh//5), :, 3] > 120
    cx = int(np.where(testa.any(axis=0))[0].mean()) if testa.any() else nw//2
    sheet.alpha_composite(fig, (i*FW + 16 - cx, FEET_Y - nh))
a = np.array(sheet)
a[:,:,3] = np.where(a[:,:,3] > 96, 255, 0)
# frammenti isolati via
alpha = a[:,:,3] > 0; visto = np.zeros_like(alpha)
for i in range(17):
    for y in range(FH):
        for x in range(i*FW, (i+1)*FW):
            if not alpha[y,x] or visto[y,x]: continue
            q, comp = deque([(y,x)]), []
            visto[y,x] = True
            while q:
                cy, cx2 = q.popleft(); comp.append((cy,cx2))
                for dy,dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    ny,nx = cy+dy, cx2+dx
                    if i*FW <= nx < (i+1)*FW and 0 <= ny < FH and alpha[ny,nx] and not visto[ny,nx]:
                        visto[ny,nx] = True; q.append((ny,nx))
            if len(comp) < 10:
                for cy,cx2 in comp: a[cy,cx2,3] = 0
Image.fromarray(a).save(destinazione("garibaldi2", "seller.png"))
print("foglio salvato")
