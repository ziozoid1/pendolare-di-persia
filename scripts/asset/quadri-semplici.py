"""
Italsider e Mergellina: fondali a immagine unica.
Ogni immagine viene scalata ad altezza 200 e traslata in verticale perche'
la quota su cui camminano le figure dipinte cada su GROUND_Y=168. Il vuoto
in basso si riempie ripetendo le ultime righe di pavimento.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image

SUOLO = 168
QUADRI = [
    ("italsider",  "italsider.jpeg",  0.860),
    ("mergellina", "mergellina.jpeg", 0.840),
]

for skin, file, frac in QUADRI:
    src = Image.open(sorgente(file)).convert("RGB")
    w, h = src.size
    scal = src.resize((round(w * 200 / h), 200), Image.BOX)
    dy = round(frac * 200) - SUOLO
    out = Image.new("RGB", (scal.width, 200))
    out.paste(scal.crop((0, dy, scal.width, 200)), (0, 0))
    if dy > 0:
        out.paste(scal.crop((0, 200 - dy - 2, scal.width, 200 - 2)), (0, 200 - dy))
    out.save(destinazione(skin, "fondale.png"))
    print(f"  {skin}: {out.width}x200 = {out.width/320:.2f} schermate")
