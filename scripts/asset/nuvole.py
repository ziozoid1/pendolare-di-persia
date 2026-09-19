"""
Nuvole per la schermata mappa, disegnate intere.
Quelle dell'immagine di riferimento stavano sui bordi e uscivano dal
fotogramma, quindi estraendole venivano monche. La palette e' campionata da
quelle originali, cosi' restano coerenti col resto della mappa.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image, ImageDraw
import math

BIANCO  = (236, 240, 244, 255)
CHIARO  = (222, 229, 238, 255)
OMBRA   = (196, 208, 222, 255)
BASE    = (172, 188, 206, 255)
CUCITURA= (206, 216, 228, 255)

def nuvola(gobbe, larghezza, altezza):
    """gobbe: elenco di (cx, cy, raggio) in frazioni della larghezza"""
    img = Image.new("RGBA", (larghezza, altezza), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    base_y = altezza - 3

    # corpo: gobbe tonde piu' una fascia continua alla base
    for fx, fy, fr in gobbe:
        cx, cy, r = fx * larghezza, fy * altezza, fr * larghezza
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BIANCO)
    d.rectangle([larghezza * 0.06, base_y - 4, larghezza * 0.94, base_y], fill=BIANCO)

    # ventre in ombra: due fasce sotto, come nelle nuvole originali
    px = img.load()
    for x in range(larghezza):
        colonna = [y for y in range(altezza) if px[x, y][3] > 0]
        if not colonna:
            continue
        b = max(colonna)
        for k, col in enumerate((OMBRA, BASE)):
            y = b - k
            if y >= 0 and px[x, y][3] > 0:
                px[x, y] = col
        t = min(colonna)
        if px[x, t][3] > 0:
            px[x, t] = (246, 249, 252, 255)      # bordo superiore illuminato

    # cuciture: le curve interne che separano una gobba dall'altra
    for fx, fy, fr in gobbe[1:]:
        cx, cy, r = fx * larghezza, fy * altezza, fr * larghezza
        for a in range(200, 340, 6):
            rad = math.radians(a)
            x = round(cx + math.cos(rad) * (r - 1))
            y = round(cy + math.sin(rad) * (r - 1))
            if 0 <= x < larghezza and 0 <= y < altezza and px[x, y][3] > 0:
                px[x, y] = CUCITURA
    return img

FORME = [
    ([(0.30, 0.62, 0.17), (0.52, 0.48, 0.22), (0.74, 0.60, 0.16)], 56, 20),
    ([(0.24, 0.66, 0.14), (0.44, 0.44, 0.20), (0.62, 0.58, 0.16), (0.80, 0.68, 0.12)], 72, 26),
    ([(0.34, 0.60, 0.19), (0.62, 0.52, 0.22)], 44, 18),
]

nuvole = [nuvola(g, w, h) for g, w, h in FORME]
FW = max(n.width for n in nuvole) + 2
FH = max(n.height for n in nuvole) + 2
foglio = Image.new("RGBA", (FW * len(nuvole), FH), (0, 0, 0, 0))
for i, n in enumerate(nuvole):
    foglio.alpha_composite(n, (i * FW + (FW - n.width) // 2, FH - n.height - 1))
foglio.save(destinazione("mappa", "nuvole.png"))
print("nuvole", [n.size for n in nuvole], "-> foglio", foglio.size, f"celle {FW}x{FH}")
