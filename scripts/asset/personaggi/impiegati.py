"""
Converte le griglie 6x3 generate in fogli sprite 544x44.
Pulizie specifiche richieste da queste due immagini:
 - riquadro 14 (push): il disegno ha aggiunto figure di sfondo, si tiene
   solo la sagoma principale
 - riquadro 15 (offer): il personaggio ha in mano i calzini, eredita' del
   prompt del venditore. Vanno via: un impiegato non vende niente.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from comune import sorgente, destinazione

from PIL import Image
import numpy as np
from collections import deque, Counter

FW, FH, FEET_Y = 32, 44, 42
SORGENTI = [
    ("manager",   "griglia-manager.jpeg"),
    ("colleague", "griglia-colleague.jpeg"),
]

def componenti(mask):
    h, w = mask.shape
    visto = np.zeros_like(mask)
    out = []
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or visto[y, x]:
                continue
            q, comp = deque([(y, x)]), []
            visto[y, x] = True
            while q:
                cy, cx = q.popleft(); comp.append((cy, cx))
                for dy, dx in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                    ny, nx = cy+dy, cx+dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visto[ny, nx]:
                        visto[ny, nx] = True; q.append((ny, nx))
            out.append(comp)
    out.sort(key=len, reverse=True)
    return out

for nome, file in SORGENTI:
    SRC = Image.open(sorgente(file)).convert("RGB")
    A = np.asarray(SRC).astype(int)
    K = SRC.width / 1030.0            # le griglie replicano il mio riferimento
    CW, CH = round(160 * K), round(220 * K)
    X0, Y0, DX, DY = 10 * K, 40 * K, 170 * K, 260 * K

    frames, alt = [], []
    for i in range(17):
        c, rr = i % 6, i // 6
        x0, y0 = round(X0 + c * DX), round(Y0 + rr * DY)
        cell = A[y0:y0 + CH, x0:x0 + CW]
        r, g, b = cell[:,:,0], cell[:,:,1], cell[:,:,2]
        lum = (r + g + b) / 3
        fuori = (g < 70) & (r - g > 40) & (b - g > 20)          # magenta
        fuori |= (g - r > 16) & (g - b > 16) & (lum < 150)       # linea verde

        m = ~fuori
        m[:6, :] = False; m[-4:, :] = False; m[:, :5] = False; m[:, -5:] = False

        rs = np.where(m.sum(axis=1) >= 5)[0]
        cs = np.where(m.sum(axis=0) >= 5)[0]
        if len(rs) == 0:
            frames.append(None); alt.append(0); continue
        rgba = np.dstack([cell.astype(np.uint8), (m * 255).astype(np.uint8)])
        frames.append({"img": Image.fromarray(rgba, "RGBA"),
                       "bbox": (int(cs.min()), int(rs.min()), int(cs.max()) + 1, int(rs.max()) + 1)})
        alt.append(int(rs.max() - rs.min()))

    normali = [alt[i] for i in range(17) if i not in (10, 11, 12, 13) and alt[i]]
    print(f"{nome}: altezze in piedi min {min(normali)} max {max(normali)} "
          f"(variazione {100*(max(normali)/min(normali)-1):.0f}%)")

    k = 40 / alt[0]
    sheet = Image.new("RGBA", (FW * 17, FH), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        if f is None: continue
        x0, y0, x1, y1 = f["bbox"]
        fig = f["img"].crop((x0, y0, x1, y1))
        nw, nh = max(1, round((x1-x0)*k)), max(1, round((y1-y0)*k))
        fig = fig.resize((nw, nh), Image.BOX)
        testa = np.array(fig)[:max(1, nh//5), :, 3] > 120
        cx = int(np.where(testa.any(axis=0))[0].mean()) if testa.any() else nw//2
        sheet.alpha_composite(fig, (i*FW + 16 - cx, FEET_Y - nh))

    # I riquadri 14 (push) e 15 (offer) sono inservibili: nel primo il disegno
    # ha aggiunto figure di sfondo attaccate al personaggio, nel secondo il
    # personaggio tiene i calzini, eredita' del prompt del venditore.
    # Il gioco non usa nessuna delle due pose per collega e manager, quindi le
    # sostituisco con pose pulite: idle al posto di push, reach al posto di offer.
    for dest, orig in ((14, 0), (15, 16)):
        blocco = sheet.crop((orig * FW, 0, orig * FW + FW, FH))
        sheet.paste((0, 0, 0, 0), (dest * FW, 0, dest * FW + FW, FH))
        sheet.alpha_composite(blocco, (dest * FW, 0))

    a = np.array(sheet)
    a[:, :, 3] = np.where(a[:, :, 3] > 96, 255, 0)
    # frammenti isolati via
    alpha = a[:, :, 3] > 0
    for i in range(17):
        sub = alpha[:, i*FW:(i+1)*FW]
        for comp in componenti(sub)[1:]:
            for cy, cx in comp:
                if len(componenti(sub)[0]) > 40:
                    a[cy, i*FW + cx, 3] = 0
    img = Image.fromarray(a)
    rgb = img.convert("RGB").quantize(colors=26, method=Image.MEDIANCUT).convert("RGB")
    finale = np.dstack([np.array(rgb), np.array(img)[:, :, 3]])
    Image.fromarray(finale.astype(np.uint8)).save(destinazione("torre-ascensori", f"{nome}.png"))
    q = np.array(Image.open(destinazione("torre-ascensori", f"{nome}.png")).convert("RGBA"))
    print(f"   salvato {nome}.png  colori {len(Counter(map(tuple, q[q[:,:,3]>0][:, :3])))}")
