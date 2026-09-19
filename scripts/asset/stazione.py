import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image, ImageDraw
import font3x5
import numpy as np, os

SRC = Image.open(sorgente("stazione-garibaldi.jpeg")).convert("RGB")
SKIN = "garibaldi2"
N = Image.NEAREST

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
cielo.save(destinazione(SKIN, "fondo.png"))

# ---- 2. parete: la scena con le aperture ritagliate --------------------
parete = scene.copy()
dp = ImageDraw.Draw(parete)
for (x0, x1) in ap:
    dp.rectangle([x0, 12, x1 - 1, GROUND_G - 16], fill=(0, 0, 0, 0))

# --- ricopro il pannello vuoto dell'originale con mattoni --------------
# I mattoni li campiono dalla parete stessa, a destra del tabellone, cosi'
# la toppa ha la stessa trama e la stessa luce.
db = ImageDraw.Draw(parete)
mattone = parete.crop((296, 110, 344, 150))   # muro vero: sotto il vecchio tabellone
# due zone: il pannello vuoto del cartellone, e il vecchio tabellone
# dell'originale, che altrimenti resterebbe visibile sotto quello nuovo.
for (rx0, ry0, rx1, ry1) in [(136, 30, 274, 130), (282, 60, 356, 108)]:
    for yy in range(ry0, ry1, mattone.height):
        for xx in range(rx0, rx1, mattone.width):
            ritaglio = mattone.crop((0, 0, min(mattone.width, rx1 - xx),
                                     min(mattone.height, ry1 - yy)))
            parete.alpha_composite(ritaglio, (xx, yy))

# --- cartello di stazione, SOPRA, come quelli delle stazioni italiane --
nome = "NAPOLI CENTRALE"
SW = font3x5.larghezza(nome) + 14
SH = 15
SX, SY = 143 + (124 - SW) // 2, 36
BLU = (20, 54, 132, 255)
db.rounded_rectangle([SX, SY, SX + SW, SY + SH], radius=4, fill=(244, 244, 244, 255))
db.rounded_rectangle([SX + 2, SY + 2, SX + SW - 2, SY + SH - 2], radius=3, fill=BLU)
font3x5.scrivi(db, SX + 7, SY + 5, nome, (248, 248, 248, 255))
# staffe di fissaggio
for sx in (SX + 10, SX + SW - 12):
    db.rectangle([sx, SY - 3, sx + 2, SY], fill=(96, 96, 108, 255))

# --- coni di luce delle tre lampade, sopra il cartello -----------------
luce = Image.new("RGBA", parete.size, (0, 0, 0, 0))
dl = ImageDraw.Draw(luce)
for lx in (160, 206, 251):
    dl.polygon([(lx - 4, 30), (lx + 4, 30), (lx + 13, 62), (lx - 13, 62)],
               fill=(255, 250, 205, 34))
parete.alpha_composite(luce)

# --- cartellone pubblicitario, SOTTO -----------------------------------
PUB = Image.open(sorgente("cartellone-scarpe.png")).convert("RGBA")
BW_, BH_ = 128, round(128 * PUB.height / PUB.width)
BX, BY = 143 + (124 - BW_) // 2, 60
pub = PUB.resize((BW_ - 4, BH_ - 4), N)
db.rectangle([BX, BY, BX + BW_ - 1, BY + BH_ - 1], fill=(122, 122, 134, 255))
db.rectangle([BX + 1, BY + 1, BX + BW_ - 2, BY + BH_ - 2], fill=(38, 38, 46, 255))
parete.alpha_composite(pub, (BX + 2, BY + 2))
# ombra sotto la cornice, per staccarla dal muro
omb = Image.new("RGBA", (BW_ + 3, 3), (0, 0, 0, 70))
parete.alpha_composite(omb, (BX + 2, BY + BH_))

# --- tabellone partenze, sul modello di quelli Trenitalia -------------
# Struttura del vero: intestazione bianca bilingue, righe in ambra su nero,
# in basso la striscia con l'avviso sulla linea gialla. Scritte col font
# 3x5, perche' il font di sistema a queste dimensioni e' illeggibile.
TX, TY, TW, TH = 274, 28, 88, 54
AMBRA = (255, 184, 28, 255)
AMBRA_SCURA = (182, 112, 10, 255)
db.rectangle([TX - 2, TY - 2, TX + TW + 1, TY + TH + 1], fill=(72, 72, 80, 255))
db.rectangle([TX, TY, TX + TW - 1, TY + TH - 1], fill=(10, 10, 12, 255))
db.rectangle([TX, TY, TX + TW - 1, TY + 8], fill=(28, 28, 32, 255))
font3x5.scrivi(db, TX + 3, TY + 2, "PARTENZE", (246, 246, 246, 255))
font3x5.scrivi(db, TX + 39, TY + 2, "DEPARTURES", (144, 144, 150, 255))
db.line([TX, TY + 9, TX + TW - 1, TY + 9], fill=(58, 58, 64, 255))

corse = [("841", "SALERNO",  "14", False),
         ("847", "CASERTA",  "-7", False),
         ("852", "FORMIA",   "22", False),
         ("855", "TORRE AN", "-3", True)]
for i, (ora, dest, bina, ritardo) in enumerate(corse):
    y = TY + 12 + i * 7
    col = AMBRA_SCURA if ritardo else AMBRA
    font3x5.scrivi(db, TX + 3, y, ora, col)
    font3x5.scrivi(db, TX + 18, y, dest, col)
    font3x5.scrivi(db, TX + TW - 11, y, bina, col)
    if ritardo:
        font3x5.scrivi(db, TX + 18, y, dest, col)

db.rectangle([TX, TY + TH - 9, TX + TW - 1, TY + TH - 1], fill=(20, 20, 22, 255))
font3x5.scrivi(db, TX + 3, TY + TH - 7, "NON OLTREPASSARE", AMBRA)
for sx in (TX + 14, TX + TW - 16):
    db.rectangle([sx, TY - 8, sx + 2, TY - 2], fill=(96, 96, 104, 255))

# --- cartacce e lattine sulla banchina --------------------------------
# Dipinte nel fondale: quando vorrai renderle interagibili andranno
# rifatte come entita', e queste qui si tolgono.
import random
random.seed(7)
CEMENTO_OMBRA = (118, 116, 110, 255)
def cartaccia(x, y):
    db.rectangle([x, y, x + 3, y + 1], fill=(228, 226, 216, 255))
    db.rectangle([x + 1, y - 1, x + 2, y], fill=(244, 242, 234, 255))
    db.point((x + 3, y + 1), fill=CEMENTO_OMBRA)
def lattina(x, y):
    db.rectangle([x, y - 2, x + 1, y + 1], fill=(198, 202, 208, 255))
    db.rectangle([x, y - 1, x + 1, y], fill=(184, 42, 38, 255))
    db.point((x + 2, y + 1), fill=CEMENTO_OMBRA)
def lattina_coricata(x, y):
    db.rectangle([x, y, x + 4, y + 1], fill=(190, 194, 202, 255))
    db.rectangle([x + 1, y, x + 2, y + 1], fill=(40, 96, 160, 255))
    db.point((x + 5, y + 1), fill=CEMENTO_OMBRA)
def mozzicone(x, y):
    db.rectangle([x, y, x + 2, y], fill=(216, 210, 190, 255))
    db.point((x + 2, y), fill=(120, 96, 60, 255))

RIFIUTI = [(cartaccia, 22), (lattina, 58), (mozzicone, 74), (cartaccia, 96),
           (lattina_coricata, 131), (mozzicone, 148), (cartaccia, 176),
           (lattina, 203), (mozzicone, 214), (cartaccia, 239),
           (lattina_coricata, 268), (mozzicone, 292), (cartaccia, 318),
           (lattina, 341), (mozzicone, 356), (cartaccia, 384)]
for fn, x in RIFIUTI:
    fn(x, 164 + random.randint(0, 5))

parete.save(destinazione(SKIN, "parete.png"))

# ---- 3. treni: locomotore + tre vagoni interi -----------------------
# Nell'originale il terzo veicolo e' tagliato dal bordo dell'area magenta,
# quindi prendo il vagone completo (452-805) e lo ripeto.
import numpy as np
area = SRC.crop((17, 690, 1055, 977)).convert("RGBA")
a = np.array(area)
r_, g_, b_ = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
mask = (r_ > 120) & (b_ > 120) & (r_ + b_ - 2 * g_ > 90)
a[mask] = [0, 0, 0, 0]
resid = (~mask) & (r_ + b_ - 2 * g_ > 40) & (a[:, :, 3] > 0)
a[:, :, 0] = np.where(resid, np.minimum(r_, g_ + 18), r_)
a[:, :, 2] = np.where(resid, np.minimum(b_, g_ + 18), b_)
area = Image.fromarray(a)

TOP, BOT = 44, 248                      # estensione verticale del convoglio
h = tr_bot - tr_top
kt = h / (BOT - TOP)
loco = area.crop((20, TOP, 452, BOT))
vag = area.crop((452, TOP, 805, BOT))
lw, vw = round(loco.width * kt), round(vag.width * kt)
loco = loco.resize((lw, h), N)
vag = vag.resize((vw, h), N)

VAGONI = 3
larghezza = lw + vw * VAGONI
strip = Image.new("RGBA", (larghezza + 84, h), (0, 0, 0, 0))
strip.alpha_composite(loco, (0, 0))
for i in range(VAGONI):
    strip.alpha_composite(vag, (lw + i * vw, 0))
strip.save(destinazione(SKIN, "treni.png"))
print("treni", strip.size, f"(locomotore {lw} + {VAGONI} vagoni da {vw})")
