# Skin: come cambiare stile senza toccare il codice

Uno skin e' una cartella qui dentro con un `skin.json`. Si attiva dall'URL:

    http://localhost:5173/?skin=nome-cartella

Quello che lo skin non dichiara resta procedurale. Puoi sostituire solo il
protagonista, o solo i fondali, e confrontare gli stili ricaricando la pagina.

## Fogli dei personaggi

La griglia canonica e' **32x44 px per frame, 17 frame su una riga sola**, in
questo ordine:

| # | clip | frame | quando si vede |
|---|------|-------|----------------|
| 0-1 | `idle` | 2 | fermo |
| 2-5 | `walk` | 4 | camminata |
| 6-9 | `run` | 4 | corsa |
| 10 | `jump` | 1 | salita del salto |
| 11 | `fall` | 1 | discesa |
| 12 | `crouch` | 1 | borsa stretta al petto |
| 13 | `trip` | 1 | inciampata |
| 14 | `push` | 1 | bloccato da qualcuno |
| 15 | `offer` | 1 | il venditore porge la merce |
| 16 | `reach` | 1 | il ladro allunga la mano |

Regole: i personaggi guardano **a destra** (il gioco specchia da solo), i piedi
poggiano a 2 px dal bordo inferiore della cella, il fondo e' trasparente.

Se il tuo foglio ha un ordine diverso, dichiara gli indici in `clips` invece di
ridisegnare.

## skin.json

```json
{
  "name": "nome-cartella",
  "actors": {
    "hero": {
      "image": "hero.png",
      "frameWidth": 32,
      "frameHeight": 44,
      "origin": [0.5, 1],
      "scale": 1,
      "clips": { "idle": [0, 1], "walk": [2, 3, 4, 5] }
    }
  },
  "props": {
    "prop:suitcase": "valigia.png",
    "prop:train": "treno.png"
  },
  "backdrops": {
    "stazione": {
      "layers": [
        { "image": "cielo.png",    "scrollFactor": 0.1, "y": 0,   "height": 60, "tile": true },
        { "image": "pensilina.png","scrollFactor": 0.45,"y": 34,  "height": 40, "tile": true },
        { "image": "pavimento.png","scrollFactor": 1,   "y": 168, "height": 32, "tile": true }
      ]
    }
  }
}
```

Attori disponibili: `hero`, `seller`, `thief`, `tourist`, `colleague`,
`manager`, `guard`.

Chiavi degli oggetti: `prop:suitcase`, `prop:train`, `prop:column`,
`prop:canopy`, `prop:skylights`, `prop:floor`, `prop:backwall`, `prop:stall`,
`prop:exit`, `prop:board_on`, `prop:board_off`.

I livelli con `tile: true` vengono ripetuti in orizzontale e scorrono con il
loro `scrollFactor` (0 = fondo immobile, 1 = ancorato al mondo).
