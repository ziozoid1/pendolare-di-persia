# Tre quadri nuovi: Bagnoli, Mergellina, Centro storico

Gli asset esistono gia' in `public/skins/`: **non ridisegnare nulla**.
Se un file ti sembra mancante, fermati e dillo.

| skin | fondale | larghezza | chiave del backdrop |
|---|---|---|---|
| `italsider` | fondale.png | 355 px | `italsider` |
| `mergellina` | fondale.png | 542 px | `mergellina` |
| `centro-storico` | fondale.png | 404 px | `centro-storico` |

Ogni fondale e' alto 200, non piastrellabile, gia' allineato: la quota su
cui camminano le figure dipinte cade esattamente su `GROUND_Y`.

## Cosa fare

Tre stage nuovi, **volutamente minimi**: servono a vedere i quadri in gioco
prima di progettarne le meccaniche. Nessun ostacolo, nessun nemico.

Per ciascuno, un file dati in `src/levels/` e una sottoclasse di
`StageScene`, sul modello di quelli esistenti:

```
StageBagnoli    skin "italsider"       backdrop "italsider"       larghezza 355
StageMergellina skin "mergellina"      backdrop "mergellina"      larghezza 542
StageStorico    skin "centro-storico"  backdrop "centro-storico"  larghezza 404
```

Per tutti e tre:
- pavimento pieno per l'intera larghezza, nessuna buca
- partenza a sinistra, `exit` a destra a 40 px dal bordo
- pazienza 3, orologio con venti minuti di margine
- `next` punta alla mappa, non a un altro stage

## Collegamento alla mappa

In `src/data/luoghi.ts` associa le scene agli indici:

```
0 ITALSIDER BAGNOLI  -> StageBagnoli
1 MERGELLINA         -> StageMergellina
2 CENTRO STORICO     -> StageStorico
```

Da ora tutti e cinque i luoghi hanno una scena, quindi la scritta
"IN COSTRUZIONE" non compare piu' per nessuno.

## Verifica

Da `?stage=1`, premi M, spostati con le frecce su ciascuno dei tre luoghi
nuovi, premi invio: si apre il quadro, il protagonista cammina da sinistra a
destra sul pavimento senza galleggiare, e arrivato all'uscita si torna alla
mappa.

Vincoli: nessuna modifica alla meccanica di gioco, nessuna riformattazione.
`npm run build` deve passare.

Branch: `feat/tre-quadri`
