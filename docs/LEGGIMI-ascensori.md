# Stage 3 — facciata con ascensori panoramici

Ricavata dall'immagine di riferimento, con una correzione necessaria: nel
disegno originale il pavimento comincia all'88% dell'altezza, mentre il gioco
appoggia i piedi all'84% (`GROUND_Y` 168 su 200). Scalando e basta, il
protagonista galleggiava di 8 px. L'immagine e' quindi alzata di 8 px e il
pavimento prolungato in basso ripetendo le ultime righe di selciato.

## Coordinate misurate sull'immagine finale

| | valore |
|---|---|
| centri dei tre vani | x = **193**, **232**, **279** |
| larghezza dei vani | 22, 26, 20 px (variano per la prospettiva) |
| fondo dei vani | y = **140** |
| quota di imbarco (bordo alto della capsula) | y = **110** |
| corsa verticale | y da **0** a **110** |

C'e' un quarto vano parziale al bordo destro (x 314), tagliato: e' decorativo.

`capsula.png` e' un foglio di **3 frame da 24x30**: in corsa, arrivata con
porte aperte e luce gialla, ferma a luci spente. Larga 24 contro i 20-26 dei
vani, quindi li riempie e sporge appena come nel riferimento fotografico.
Per centrarla: `x = centro - 12`.

## Da aggiornare in `src/levels/stage3.ts`

```
frontX: 212,      // testa della fila, davanti ai vani
doorA: 232,       // vano centrale
doorB: 279,       // vano di destra
```

Il vano a x 193 resta senza cabina: il codice gestisce due cabine e i vani
sono tre. A differenza della versione precedente qui non c'e' il cartello
GUASTO, perche' l'immagine non lo prevede — se lo vuoi, si aggiunge
disegnandolo sopra la facciata.

## Spazio per la fila

I due terzi sinistri sono liberi da qualsiasi elemento in primo piano: la
fila puo' arrivare a dieci persone, circa 130 px, e ci sta tutta.
