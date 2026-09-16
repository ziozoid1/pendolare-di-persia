from PIL import Image
import numpy as np
from collections import deque

SRC = Image.open("/mnt/user-data/uploads/Gemini_Generated_Image_kr14d5kr14d5kr14.jpeg").convert("RGB")
A = np.asarray(SRC).astype(int)

COLS = [(17,162),(172,315),(324,468),(477,621),(630,773),(783,928)]
SUOLO = [358, 694, 1032]          # riga verde: i piedi poggiano qui
TOP   = [110, 447, 785]           # bordo alto dei pannelli, stimato dal passo
FW, FH, FEET_Y = 32, 44, 42

def scontorna(panel):
    """
    Lo sfondo e' un insieme ristretto di grigi bluastri: li campiono dalle
    prime righe del pannello, che sono sempre vuote, e tolgo tutto cio' che
    gli somiglia. Piu' robusto del riempimento per contiguita', che si
    inceppava sulla cornice del riquadro.
    """
    h, w, _ = panel.shape
    campioni = []
    for y in list(range(0, 12)) + [h - 1]:
        for x in range(0, w, 3):
            c = panel[y, x]
            if not any(abs(c - s2).sum() < 24 for s2 in campioni):
                campioni.append(c)
    fuori = np.zeros((h, w), bool)
    for c in campioni:
        fuori |= (np.abs(panel - c).sum(axis=2) < 46)
    r, g, b = panel[:, :, 0], panel[:, :, 1], panel[:, :, 2]
    fuori |= (g - r > 18) & (g - b > 18) & (g > 60)   # linea verde e suoi bordi sfumati
    return ~fuori

frames = []
for ri in range(3):
    for ci, (x0, x1) in enumerate(COLS):
        if ri * 6 + ci >= 17: break
        y0, y1 = TOP[ri], SUOLO[ri] + 6
        panel = A[y0:y1, x0:x1]
        m = scontorna(panel)
        m[SUOLO[ri] - y0:, :] = False      # niente sotto la linea del suolo
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
    fig = fig.resize((nw, nh), Image.LANCZOS)
    # ancoraggio orizzontale sulla testa: piu' stabile del centro del riquadro
    testa = np.array(fig)[:max(1, nh // 5), :, 3] > 128
    cx = int(np.where(testa.any(axis=0))[0].mean()) if testa.any() else nw // 2
    # i piedi vanno sulla linea del suolo del pannello
    piedi = round((f["suolo"] - y0) * k)
    sheet.alpha_composite(fig, (i * FW + 16 - cx, FEET_Y - piedi))

# ripulisco i bordi semitrasparenti lasciati dal ridimensionamento
a = np.array(sheet)
a[:, :, 3] = np.where(a[:, :, 3] > 110, 255, 0)
Image.fromarray(a).save("/home/claude/hero-nuovo.png")
print("foglio", sheet.size)
