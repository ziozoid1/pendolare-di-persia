"""
Foglio del gatto dai fotogrammi generati.
Due correzioni necessarie: in qualche riquadro il gatto ha la testa a
sinistra invece che a destra, e i fotogrammi della seconda riga sono il 20%
piu' grandi di quelli della prima. Senza normalizzare, svegliandosi il gatto
si girerebbe e crescerebbe.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np

SRC = Image.open(sorgente("griglia-gatto.jpeg")).convert("RGB")
W, H = SRC.size
CW, CH = W / 4, H / 4
CELLE = [(0, c) for c in range(4)] + [(2, c) for c in range(4)]
LARG_GIOCO = 24            # come il gatto dipinto nel fondale originale

def estrai(rr, cc):
    x0, y0 = round(cc * CW) + 8, round(rr * CH) + 8
    x1, y1 = round((cc + 1) * CW) - 8, round((rr + 1) * CH) - 8
    cell = np.asarray(SRC.crop((x0, y0, x1, y1))).astype(int)
    r, g, b = cell[:, :, 0], cell[:, :, 1], cell[:, :, 2]
    mag = (r > 140) & (b > 140) & (g < 130)
    m = ~mag
    rs = np.where(m.sum(axis=1) >= 4)[0]
    cs = np.where(m.sum(axis=0) >= 4)[0]
    if len(rs) == 0:
        return None
    m[:rs.min(), :] = False; m[rs.max()+1:, :] = False
    m[:, :cs.min()] = False; m[:, cs.max()+1:] = False
    rgba = np.dstack([cell.astype(np.uint8), (m * 255).astype(np.uint8)])
    img = Image.fromarray(rgba, "RGBA").crop((int(cs.min()), int(rs.min()),
                                              int(cs.max()) + 1, int(rs.max()) + 1))
    return img

def testa_a_destra(img):
    """la testa e' dove stanno le orecchie: guardo il baricentro in alto"""
    a = np.array(img)[:, :, 3] > 0
    alto = a[:max(1, int(a.shape[0] * 0.22))]
    if not alto.any():
        return True
    xs = np.where(alto.any(axis=0))[0]
    return xs.mean() > a.shape[1] / 2

grezzi = []
for rr, cc in CELLE:
    img = estrai(rr, cc)
    if img is None:
        continue
    if not testa_a_destra(img):
        img = img.transpose(Image.FLIP_LEFT_RIGHT)
    grezzi.append(((rr, cc), img))

# normalizzo la scala per riga: la prima riga e' il riferimento
rif = grezzi[0][1].width
per_riga = {}
for (rr, _), img in grezzi:
    per_riga.setdefault(rr, []).append(img.width)
scale = {rr: rif / (sum(v) / len(v)) for rr, v in per_riga.items()}
print("larghezze medie per riga:", {k: round(sum(v)/len(v)) for k, v in per_riga.items()})
print("fattori di normalizzazione:", {k: round(v, 3) for k, v in scale.items()})

k = LARG_GIOCO / rif
finali = []
for (rr, cc), img in grezzi:
    s = k * scale[rr]
    nw, nh = max(1, round(img.width * s)), max(1, round(img.height * s))
    f = img.resize((nw, nh), Image.BOX)
    pa = np.array(f); pa[:, :, 3] = np.where(pa[:, :, 3] > 110, 255, 0)
    finali.append(Image.fromarray(pa))

FW = max(f.width for f in finali) + 2
FH = max(f.height for f in finali) + 1
foglio = Image.new("RGBA", (FW * len(finali), FH), (0, 0, 0, 0))
for i, f in enumerate(finali):
    a = np.array(f)[:, :, 3] > 0
    cs = np.where(a.sum(axis=0) >= 3)[0]
    # ancoraggio sul dorso: la zampa protesa non deve spostare il gatto
    dorso = np.where(np.array(f)[:max(1, f.height//2), :, 3].sum(axis=0) > 0)[0]
    cx = int(dorso.mean()) if len(dorso) else f.width // 2
    foglio.alpha_composite(f, (i * FW + FW // 2 - cx, FH - f.height))
foglio.save(destinazione("centro-direzionale", "gatto.png"))
print("foglio gatto", foglio.size, f"({len(finali)} frame da {FW}x{FH})")
