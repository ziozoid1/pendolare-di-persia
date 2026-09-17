from PIL import Image
import os
SRC = Image.open("/mnt/user-data/uploads/centro-direzionale.jpeg").convert("RGBA")
OUT = "/home/claude/skin-cd"
N = Image.NEAREST
os.makedirs(OUT, exist_ok=True)

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
