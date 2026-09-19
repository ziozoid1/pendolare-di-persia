"""
Capsula dell'ascensore panoramico, taglia adatta ai vani della facciata:
misurati 20-26 px per la prospettiva, quindi 24 di larghezza li riempie e
sporge appena, come nel riferimento fotografico.
Tre frame: in corsa, arrivata con le porte aperte, ferma a luci spente.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import sorgente, destinazione

from PIL import Image, ImageDraw

FW, FH = 24, 30
LUCE   = (214, 218, 216)
CHIARO = (178, 184, 182)
MEDIO  = (142, 150, 148)
OMBRA  = (100, 108, 108)
NERO   = (58, 64, 66)
VETRO  = (74, 96, 106)
VETRO_L= (116, 142, 150)
ACCESA = (255, 232, 158)
INTERNO= (42, 48, 52)
CAVO   = (76, 80, 82)

def tono(i):
    t = i / (FW - 1)
    if t < 0.08: return NERO
    if t < 0.20: return OMBRA
    if t < 0.34: return CHIARO
    if t < 0.46: return LUCE
    if t < 0.66: return CHIARO
    if t < 0.84: return MEDIO
    if t < 0.94: return OMBRA
    return NERO

def capsula(stato):
    """stato: 'corsa', 'aperta', 'spenta'"""
    img = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # cavo di sospensione
    d.line([FW // 2, 0, FW // 2, 2], fill=CAVO)
    # calotta superiore arrotondata
    for j, r in enumerate((7, 4, 2, 1)):
        for i in range(r, FW - r):
            d.point((i, 3 + j), fill=tono(i) if j > 1 else MEDIO)
    # corpo
    for i in range(FW):
        d.line([i, 7, i, FH - 6], fill=tono(i))
    # fasce vetrate
    for y in range(9, FH - 8, 5):
        if stato == "aperta":
            d.rectangle([2, y, FW - 3, y + 3], fill=INTERNO)
            d.line([3, y + 1, FW - 4, y + 1], fill=ACCESA)
            d.line([3, y + 2, FW - 4, y + 2], fill=(190, 170, 110))
        else:
            d.rectangle([2, y, FW - 3, y + 3], fill=VETRO)
            d.line([2, y, FW - 3, y], fill=VETRO_L)
            if stato == "corsa":
                d.line([FW - 6, y + 1, FW - 4, y + 1], fill=VETRO_L)
    # montanti verticali della cabina
    for x in (5, FW - 6):
        d.line([x, 9, x, FH - 9], fill=OMBRA)
    # calotta inferiore
    for j, r in enumerate((1, 2, 4, 7)):
        for i in range(r, FW - r):
            d.point((i, FH - 5 + j), fill=tono(i) if j < 2 else OMBRA)
    return img

frames = [capsula("corsa"), capsula("aperta"), capsula("spenta")]
sheet = Image.new("RGBA", (FW * 3, FH), (0, 0, 0, 0))
for i, f in enumerate(frames):
    sheet.alpha_composite(f, (i * FW, 0))
sheet.save(destinazione("torre-ascensori", "capsula.png"))
print("capsula", sheet.size, "(3 frame da 24x30: corsa, aperta, spenta)")
