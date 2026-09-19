"""
Prepara i fondali dei tre quadri nuovi.
Ogni immagine viene scalata ad altezza 200 e traslata in verticale perche'
la quota su cui camminano le figure dipinte cada su GROUND_Y=168. Il vuoto
che si crea in basso viene riempito ripetendo le ultime righe di pavimento.
"""
from PIL import Image
import os

QUADRI = [
    ("italsider",      "italsider-stage.jpeg",         0.860),
    ("mergellina",     "Gemini_Generated_Image_z1ou2pz1ou2pz1ou.jpeg", 0.840),
    ("centro-storico", "Gemini_Generated_Image_hqtktmhqtktmhqtk.jpeg", 0.875),
]
SUOLO = 168

for nome, file, frac in QUADRI:
    src = Image.open(f"/mnt/user-data/uploads/{file}").convert("RGB")
    w, h = src.size
    scal = src.resize((round(w * 200 / h), 200), Image.BOX)
    dy = round(frac * 200) - SUOLO
    out = Image.new("RGB", (scal.width, 200))
    out.paste(scal.crop((0, dy, scal.width, 200)), (0, 0))
    if dy > 0:
        coda = scal.crop((0, 200 - dy - 2, scal.width, 200 - 2))
        out.paste(coda, (0, 200 - dy))
    cart = f"/home/claude/consegna2/public/skins/{nome}"
    os.makedirs(cart, exist_ok=True)
    out.save(f"{cart}/fondale.png")
    print(f"{nome}: {out.width}x200 = {out.width/320:.2f} schermate")
