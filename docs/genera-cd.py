from PIL import Image
import os
SRC = Image.open("/mnt/user-data/uploads/centro-direzionale.jpeg").convert("RGBA")
OUT = "/home/claude/skin-cd"
N = Image.NEAREST
os.makedirs(OUT, exist_ok=True)

# --- via i passanti, restano gatto e topo --------------------------------
# Ogni figura viene coperta con una zona pulita presa alla stessa altezza:
# panchine, fioriere e pavimento si ripetono, quindi la toppa non si nota.
TOPPE = [
    ((35, 455, 80, 585),  195),   # uomo a sinistra      <- da x 195
    ((146, 450, 194, 530), 246),  # due figure lontane   <- da x 246
    ((915, 450, 970, 585), 836),  # uomo a destra        <- da x 836
]
for (x0, y0, x1, y1), src_x in TOPPE:
    patch = SRC.crop((src_x, y0, src_x + (x1 - x0), y1))
    SRC.paste(patch, (x0, y0))

# Via anche gatto e topo: diventeranno sprite animati, e se restassero
# dipinti qui se ne vedrebbero due di ciascuno.
TOPPE_ANIMALI = [
    ((322, 486, 402, 536), 430),   # gatto sulla panchina  <- da x 430
    ((728, 530, 790, 562), 600),   # topo sul selciato     <- da x 600
]
for (x0, y0, x1, y1), src_x in TOPPE_ANIMALI:
    patch = SRC.crop((src_x, y0, src_x + (x1 - x0), y1))
    SRC.paste(patch, (x0, y0))

# I passanti nel disegno hanno i piedi a y=568: e' la quota del marciapiede.
# Scalando cosi', quella quota cade su GROUND_Y=168 e l'immagine intera
# occupa esattamente 200 px di altezza.
GROUND_SRC = 568
GH = 200
k = GH / SRC.height
GW = round(SRC.width * k)
scena = SRC.resize((GW, GH), N)
print("scena", scena.size, " suolo a y =", round(GROUND_SRC * k))

# taglio dove i palazzi incontrano le fioriere: sopra la citta' lontana,
# sotto la piazza su cui si cammina
TAGLIO = round(472 * k)
citta = scena.crop((0, 0, GW, TAGLIO + 3))
piazza = scena.crop((0, TAGLIO, GW, GH))
citta.save(f"{OUT}/citta.png")
piazza.save(f"{OUT}/piazza.png")
print("citta", citta.size, " piazza", piazza.size, " taglio a y =", TAGLIO)
