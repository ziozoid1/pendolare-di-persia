# Schermata mappa, richiamabile col tasto M

Gli asset esistono gia' in `public/skins/mappa/`: **non ridisegnare nulla**.
Se un file ti sembra mancante, fermati e dillo.

- `mappa.png` — fondale 320x200, gia' senza nuvole e col titolo sul cartiglio
- `nuvole.png` — foglio di 3 nuvole, **celle da 74x28**, trasparenti

## Comportamento

- `M` apre la mappa, `M` o `ESC` la chiude. Il gioco si mette in pausa:
  fisica ferma, orologio fermo, nessuna entita' aggiornata. Riprende alla
  chiusura.
- Non e' navigabile: e' una schermata informativa, non un menu.

## Segnalino

- Il protagonista in piedi sul luogo corrente, animazione `walk` in loop
  cosi' cammina sul posto, sprite a grandezza naturale 32x44, piedi
  appoggiati alla quota indicata sotto.
- Contorno di un pixel attorno alla sagoma, in colore chiaro: la mappa e'
  fitta e senza contorno il personaggio si perde.
- Sotto il segnalino, il nome del luogo su una targa scura, col font pixel
  del gioco.

## I cinque luoghi

Coordinate dei **piedi** del segnalino, misurate sulla mappa:

| indice | nome | x | y |
|---|---|---|---|
| 0 | ITALSIDER BAGNOLI | 40 | 76 |
| 1 | MERGELLINA | 92 | 100 |
| 2 | CENTRO STORICO | 163 | 90 |
| 3 | P. GARIBALDI | 232 | 74 |
| 4 | CENTRO DIREZIONALE | 292 | 50 |

Mettili in `src/data/luoghi.ts`: indice, nome, coordinate. Ogni `StageDef`
dichiara a quale indice corrisponde. Oggi: stage 1 -> 3, stage 2 -> 4,
stage 3 -> 4. Gli stage futuri useranno 0, 1 e 2.

## Nuvole

- Tre sprite dal foglio, gli unici elementi mobili della schermata.
- Scorrono in orizzontale a velocita' diverse fra loro, fra 2 e 5 px al
  secondo, e rientrano dal lato opposto quando escono.
- Posizioni iniziali: (60, 6), (196, 104), (250, 146).
- Profondita' sopra la mappa ma sotto il segnalino.

## Comandi

Aggiungi `M   MAPPA` all'elenco nella schermata OPZIONI.

## Verifica

Premendo M da uno stage qualsiasi si apre la mappa, il protagonista cammina
sul posto giusto, le nuvole scorrono, M o ESC chiude e il gioco riprende
esattamente da dov'era.

Branch: `feat/mappa`
