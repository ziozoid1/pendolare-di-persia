from PIL import Image, ImageDraw
import numpy as np, os

SRC = Image.open("/mnt/user-data/uploads/Gemini_Generated_Image_prtqerprtqerprtq.jpeg").convert("RGB")
OUT = "/home/claude/skin-garibaldi2"
N = Image.NEAREST
os.makedirs(OUT, exist_ok=True)

# ---- geometria misurata sull'originale --------------------------------
SCENE_BOTTOM = 530          # sotto restano il livello di servizio e i sotterranei
GROUND_SRC   = 445          # dove poggiano i piedi sulla banchina
GW, GH       = 405, 200     # la scena alla risoluzione di gioco
GROUND_G     = round(GROUND_SRC * GH / SCENE_BOTTOM)   # = 168, come nel gioco
APERTURE     = [(18, 337), (964, 1064)]
TRENO_SRC    = (275, 400)   # fascia verticale dei treni di fondo

k = GW / SRC.width
scene = SRC.crop((0, 0, SRC.width, SCENE_BOTTOM)).resize((GW, GH), N).convert("RGBA")
print("scena", scene.size, "suolo a y =", GROUND_G)

ap = [(round(a * k), round(b * k)) for a, b in APERTURE]
tr_top, tr_bot = [round(v * GH / SCENE_BOTTOM) for v in TRENO_SRC]
print("aperture", ap, " fascia treni y", tr_top, tr_bot)

# ---- 1. fondo: cio' che si vede dalle aperture, treni cancellati -------
fondo = scene.copy()
fp = fondo.load()
CLEAN = tr_top - 4                      # ultima riga senza treni
for y in range(CLEAN, GROUND_G - 6):
    t = min(1.0, (y - CLEAN) / max(1, (GROUND_G - 6 - CLEAN)))
    for x in range(GW):
        r, g, b, _ = fp[x, CLEAN]
        f = 1 - 0.45 * t                # sfuma verso il buio della banchina lontana
        fp[x, y] = (round(r * f), round(g * f), round(b * f), 255)
# il fondo deve essere cielo continuo: prendo il contenuto dell'apertura di
# sinistra e lo ripeto, altrimenti in parallasse comparirebbero pezzi di muro
sx0, sx1 = ap[0]
pezzo = fondo.crop((sx0 + 2, 0, sx1 - 2, GROUND_G))
cielo = Image.new("RGBA", (pezzo.width * 3, GROUND_G), (0, 0, 0, 255))
for i in range(3):
    cielo.alpha_composite(pezzo, (i * pezzo.width, 0))
cielo.save(f"{OUT}/fondo.png")

# ---- 2. parete: la scena con le aperture ritagliate --------------------
parete = scene.copy()
dp = ImageDraw.Draw(parete)
for (x0, x1) in ap:
    dp.rectangle([x0, 12, x1 - 1, GROUND_G - 16], fill=(0, 0, 0, 0))

# --- cartellone: contenuto disegnato a risoluzione di gioco ------------
BX, BY, BW_, BH_ = 143, 36, 124, 84
db = ImageDraw.Draw(parete)
CREMA, SCURO = (238, 233, 201, 255), (38, 38, 48, 255)
db.rectangle([BX, BY, BX + BW_, BY + BH_], fill=CREMA)
db.rectangle([BX + 3, BY + 46, BX + BW_ - 3, BY + 47], fill=SCURO)
# figura generica che indica
db.rectangle([BX + 18, BY + 12, BX + 28, BY + 21], fill=(206, 154, 96, 255))
db.rectangle([BX + 18, BY + 9,  BX + 28, BY + 13], fill=(42, 34, 30, 255))
db.polygon([(BX + 14, BY + 22), (BX + 32, BY + 22), (BX + 36, BY + 45), (BX + 10, BY + 45)],
           fill=(62, 74, 98, 255))
db.rectangle([BX + 21, BY + 24, BX + 25, BY + 36], fill=CREMA)
db.line([BX + 32, BY + 26, BX + 52, BY + 22], fill=(62, 74, 98, 255), width=4)
db.rectangle([BX + 50, BY + 19, BX + 56, BY + 24], fill=(206, 154, 96, 255))
# scarpa senza marchio
db.polygon([(BX + 66, BY + 32), (BX + 76, BY + 20), (BX + 98, BY + 20),
            (BX + 112, BY + 28), (BX + 112, BY + 35), (BX + 66, BY + 35)], fill=(92, 98, 114, 255))
db.rectangle([BX + 66, BY + 34, BX + 112, BY + 39], fill=(198, 158, 118, 255))
db.rectangle([BX + 66, BY + 38, BX + 112, BY + 41], fill=(242, 242, 236, 255))
db.line([BX + 82, BY + 23, BX + 100, BY + 23], fill=(146, 154, 172, 255), width=1)
t = "SCARPE PEPPISH"
tw = db.textlength(t)
db.text((BX + (BW_ - tw) / 2, BY + 52), t, fill=SCURO)

# --- tabellone partenze, in italiano ----------------------------------
righe = [("NAPOLI  8:41", (255, 255, 85, 255)),
         ("SALERNO 8:47", (255, 255, 85, 255)),
         ("CASERTA RIT.", (190, 110, 20, 255))]
TW = round(max(db.textlength(r) for r, _ in righe)) + 8
TH = 36
TX, TY = 348 - TW, 68
db.rectangle([TX, TY, TX + TW, TY + TH], fill=(14, 14, 18, 255))
db.rectangle([TX, TY, TX + TW, TY + 1], fill=(120, 120, 130, 255))
db.text((TX + 4, TY + 2), "PARTENZE", fill=(235, 235, 235, 255))
for i, (r, col) in enumerate(righe):
    db.text((TX + 4, TY + 12 + i * 8), r, fill=col)

# --- cartello di stazione, blu con bordo bianco -----------------------
nome = "NAPOLI CENTRALE"
SW = round(db.textlength(nome)) + 16
SH = 17
SX, SY = BX + (BW_ - SW) // 2, 132
BLU = (18, 52, 128, 255)
db.rectangle([SX, SY, SX + SW, SY + SH], fill=(240, 240, 240, 255))
db.rectangle([SX + 2, SY + 2, SX + SW - 2, SY + SH - 2], fill=BLU)
db.text((SX + 8, SY + 4), nome, fill=(245, 245, 245, 255))
parete.save(f"{OUT}/parete.png")

# ---- 3. treni: dal fondo magenta, scalati alla fascia -----------------
tren = SRC.crop((17, 690, 1055, 977)).convert("RGBA")
a = np.array(tren)
r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
mask = (r > 120) & (b > 120) & (r + b - 2 * g > 90)   # tutto cio' che tende al magenta
a[mask] = [0, 0, 0, 0]
# despill: dove resta una dominante rosa, riporto rosso e blu verso il verde
resid = (~mask) & (r + b - 2 * g > 40) & (a[:, :, 3] > 0)
a[:, :, 0] = np.where(resid, np.minimum(r, g + 18), r)
a[:, :, 2] = np.where(resid, np.minimum(b, g + 18), b)
tren = Image.fromarray(a)
bb = tren.getbbox()
tren = tren.crop(bb)
h = tr_bot - tr_top
w = round(tren.width * h / tren.height)
tren = tren.resize((w, h), N)
strip = Image.new("RGBA", (max(GW, w + 120), h), (0, 0, 0, 0))
strip.alpha_composite(tren, (0, 0))
strip.save(f"{OUT}/treni.png")
print("treni", strip.size, " (convoglio", tren.size, ")")
