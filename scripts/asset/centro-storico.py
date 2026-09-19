"""
Sposta i due gruppi di tavolini vicino al vecchietto, a quote diverse.
Nell'immagine generata stavano nella fascia bassa, cioe' nella corsia in cui
cammina il giocatore, e lui ci passava dentro.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np

SRC = Image.open(sorgente("centro-storico.jpeg")).convert("RGB")
im = SRC.copy()
a = np.asarray(im).astype(int)

GRUPPI = [
    # (riquadro di origine, destinazione centro-x, base-y, scala)
    ((50, 520, 228, 620),  318, 556, 0.80),   # piu' indietro, piu' piccolo
    ((393, 516, 598, 650), 452, 588, 0.90),   # meno indietro
]

# --- cancello i gruppi dalla posizione originale ----------------------
# Riempio con il pavimento: per ogni riga copio il tono di una colonna
# pulita alla stessa altezza. Le fughe diagonali si perdono, ma alla scala
# del gioco quella fascia e' alta una trentina di pixel e non si nota.
# Copio un blocco di pavimento vero da una zona pulita e lo ripeto: cosi'
# restano le fughe fra le lastre, che sintetizzandole si perdevano.
PAV = SRC.crop((620, 596, 800, 716))
im = Image.fromarray(a.astype(np.uint8))
for (x0, y0, x1, y1), *_ in GRUPPI:
    for yy in range(y0, y1, PAV.height):
        for xx in range(x0, x1, PAV.width):
            ritaglio = PAV.crop((0, 0, min(PAV.width, x1 - xx), min(PAV.height, y1 - yy)))
            im.paste(ritaglio, (xx, yy))

# --- rimetto i gruppi nella nuova posizione ---------------------------
for (x0, y0, x1, y1), dx, base, s in GRUPPI:
    pezzo = SRC.crop((x0, y0, x1, y1))
    nw, nh = round(pezzo.width * s), round(pezzo.height * s)
    pezzo = pezzo.resize((nw, nh), Image.BOX)
    im.paste(pezzo, (dx - nw // 2, base - nh))

pass

# --- pipeline verso il gioco -----------------------------------------
w, h = im.size
sc = im.resize((round(w * 200 / h), 200), Image.BOX)
dy = round(0.875 * 200) - 168
out = Image.new("RGB", (sc.width, 200))
out.paste(sc.crop((0, dy, sc.width, 200)), (0, 0))
if dy > 0:
    out.paste(sc.crop((0, 200 - dy - 2, sc.width, 200 - 2)), (0, 200 - dy))
out.save(destinazione("centro-storico", "fondale.png"))
print("fondale", out.size)
