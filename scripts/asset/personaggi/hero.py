import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np
from collections import deque

SRC = Image.open(sorgente("griglia-hero.jpeg")).convert("RGB")
A = np.asarray(SRC).astype(int)

COLS = [(17,162),(172,315),(324,468),(477,621),(630,773),(783,928)]
SUOLO = [358, 694, 1032]          # riga verde: i piedi poggiano qui
TOP   = [110, 447, 785]           # bordo alto dei pannelli, stimato dal passo
FW, FH, FEET_Y = 32, 44, 42

def scontorna(panel):
    """
    Lo sfondo del disegno e' un grigio-blu neutro: rosso e verde coincidono.
    I jeans invece hanno il verde sopra il rosso di 9-18, pur essendo scuri
    quanto lo sfondo. Separarli per distanza di colore non funziona (distano
    30 su 255), separarli per neutralita' si'.
    Poi tengo solo le zone di sfondo che toccano il bordo del pannello, cosi'
    un'ombra interna al personaggio non puo' aprire un buco.
    """
    h, w, _ = panel.shape
    r, g, b = panel[:, :, 0], panel[:, :, 1], panel[:, :, 2]
    lum = (r + g + b) / 3
    neutro = np.abs(g - r) <= 4
    bluastro = (b - g >= 8) & (b - g <= 34)
    fondo = neutro & bluastro & (lum >= 12) & (lum <= 120)
    fondo |= (g - r > 18) & (g - b > 18) & (g > 60)   # linea verde del suolo

    # solo le componenti attaccate al bordo sono davvero "fuori"
    vis = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if fondo[y, x] and not vis[y, x]: vis[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if fondo[y, x] and not vis[y, x]: vis[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and fondo[ny, nx] and not vis[ny, nx]:
                vis[ny, nx] = True
                q.append((ny, nx))
    return ~vis

frames = []
for ri in range(3):
    for ci, (x0, x1) in enumerate(COLS):
        if ri * 6 + ci >= 17: break
        y0, y1 = TOP[ri], SUOLO[ri] + 6
        panel = A[y0:y1, x0:x1]
        m = scontorna(panel)
        m[SUOLO[ri] - y0 - 3:, :] = False   # niente sotto la linea del suolo, bordi sfumati inclusi
        # limiti robusti: righe e colonne con almeno 6 pixel, cosi' il rumore
        # JPEG agli angoli non allarga il riquadro all'intero pannello
        rr = np.where(m.sum(axis=1) >= 6)[0]
        cc = np.where(m.sum(axis=0) >= 6)[0]
        if len(rr) == 0 or len(cc) == 0:
            frames.append(None); continue
        m[:rr.min(), :] = False; m[rr.max() + 1:, :] = False
        m[:, :cc.min()] = False; m[:, cc.max() + 1:] = False
        ys, xs = rr, cc
        frames.append({
            "img": Image.fromarray(np.dstack([panel.astype(np.uint8),
                                              (m * 255).astype(np.uint8)]), "RGBA"),
            "bbox": (int(cc.min()), int(rr.min()), int(cc.max()) + 1, int(rr.max()) + 1),
            "suolo": SUOLO[ri] - y0,
        })

alt = [f["bbox"][3] - f["bbox"][1] for f in frames if f]
print("altezze figura nei pannelli:", alt)
print("min/max:", min(alt), max(alt), " variazione", f"{(max(alt)/min(alt)-1)*100:.0f}%")

# scala unica per tutti i frame: la figura in piedi deve stare in 40 px
h_idle = frames[0]["bbox"][3] - frames[0]["bbox"][1]
k = 40 / h_idle
print("scala", round(k, 3))

sheet = Image.new("RGBA", (FW * 17, FH), (0, 0, 0, 0))
for i, f in enumerate(frames):
    if f is None: continue
    x0, y0, x1, y1 = f["bbox"]
    fig = f["img"].crop((x0, y0, x1, y1))
    nw, nh = max(1, round((x1 - x0) * k)), max(1, round((y1 - y0) * k))
    fig = fig.resize((nw, nh), Image.BOX)
    # ancoraggio orizzontale sulla testa: piu' stabile del centro del riquadro
    testa = np.array(fig)[:max(1, nh // 5), :, 3] > 128
    cx = int(np.where(testa.any(axis=0))[0].mean()) if testa.any() else nw // 2
    # i piedi vanno sulla linea del suolo del pannello
    piedi = round((f["suolo"] - y0) * k)
    sheet.alpha_composite(fig, (i * FW + 16 - cx, FEET_Y - piedi))

# ripulisco i bordi semitrasparenti lasciati dal ridimensionamento
a = np.array(sheet)
a[:, :, 3] = np.where(a[:, :, 3] > 96, 255, 0)
Image.fromarray(a).save(destinazione("garibaldi2", "hero.png"))
print("foglio", sheet.size)
