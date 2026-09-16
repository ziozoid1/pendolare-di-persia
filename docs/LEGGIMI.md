# Skin "garibaldi2" - stazione di Piazza Garibaldi

Ricomposta dall'immagine di riferimento alla risoluzione del gioco, senza
ridisegnare: la scena e' stata ritagliata, scalata e divisa in tre piani.

## Come e' fatta

L'originale e' 1072x992 e contiene due cose: la scena della stazione in alto e
il convoglio su fondo magenta in basso. La scena e' stata tagliata a y=530,
scartando il livello di servizio sotto i binari che non entra in 200 px, e
scalata a **405x200**. A quella scala la banchina cade esattamente a y=168, che
e' il `GROUND_Y` del gioco: i piedi del protagonista poggiano dove devono.

| file | y | altezza | scorrimento |
|------|---|---------|-------------|
| `fondo.png` | 0 | 168 | 0.35, lontano |
| `treni.png` | 104 | 47 | 0.6 + velocita' 9 px/s |
| `parete.png` | 0 | 200 | 1, ancorato |

`parete.png` e' la scena completa (muro, cartellone, banchina, binari) con due
**aperture trasparenti** dove nell'originale si vede fuori: e' da li' che si
intravede il convoglio che passa. `fondo.png` non e' la scena intera ma solo il
contenuto di un'apertura, ripetuto: se contenesse anche il muro, scorrendo in
parallasse comparirebbero mattoni dentro le aperture.

Il convoglio viene dal fondo magenta dell'originale, scontornato con una soglia
sul magenta piu' una correzione dell'alone rosato sui bordi.

## Cosa e' stato ridisegnato

Tre elementi sono stati rifatti a risoluzione di gioco, quindi sono nitidi e in
italiano:

- **Il cartellone** aveva il pannello vuoto: contiene ora la figura che indica,
  la scarpa e la scritta SCARPE PEPPISH.
- **Il tabellone partenze** diceva DEPARTURES con testo illeggibile: ora e'
  PARTENZE con Napoli, Salerno e Caserta in ritardo.
- **Il cartello di stazione** blu con bordo bianco, che nell'originale non
  c'era.

## Limiti noti

La parete si ripete ogni 405 px, cioe' poco piu' di una schermata: con la
camera che salta di 320 px alla volta, il tabellone partenze a volte cade a
cavallo del bordo dello schermo. Per evitarlo servirebbe una parete larga 640
con gli elementi distribuiti diversamente.

## Rigenerare

`genera-stazione.py` ricostruisce i tre piani dall'immagine sorgente. In cima
ci sono le coordinate misurate sull'originale: `GROUND_SRC` (dove poggiano i
piedi), `APERTURE` (le finestre nel muro) e `TRENO_SRC` (la fascia dei treni).
