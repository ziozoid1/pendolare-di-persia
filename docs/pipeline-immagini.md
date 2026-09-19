# Come si producono le immagini del gioco

Nessun PNG di `public/skins/` va modificato a mano. Ognuno e' il risultato
di uno script che parte da un'immagine in `assets-sorgente/`.

```
assets-sorgente/*.jpeg   →   scripts/asset/*.py   →   public/skins/**/*.png
   (disegni originali)        (taglio, scala,           (quello che il
                               allineamento)             gioco carica)
```

## Rigenerare

```
./scripts/rigenera.sh              tutto
./scripts/rigenera.sh stazione     solo un fondale
./scripts/rigenera.sh topo         solo un personaggio
```

## Perche' esiste questo passaggio

Le immagini generate arrivano a 1300 px di larghezza, il gioco ne ha 320.
Ridurle e basta non funziona: la quota su cui camminano le figure disegnate
non coincide con `GROUND_Y`, e il personaggio galleggia o sprofonda. Ogni
script fa tre cose:

1. **scala** l'immagine ad altezza 200;
2. **trasla** in verticale perche' il pavimento cada esattamente su
   `GROUND_Y = 168`, riempiendo il vuoto in basso;
3. **ridisegna a risoluzione di gioco** le scritte, che ridotte sarebbero
   illeggibili: tabelloni, insegne, titoli, usando il font 3x5.

I numeri che governano tutto questo stanno in cima a ogni script. Per
spostare un cartellone, cambiare una scritta o alzare un gruppo di
tavolini si cambia un numero e si rigenera: **non serve una nuova
immagine**.

## I personaggi

`personaggi/hero.py` estrae le 17 pose dalla griglia generata, le scontorna
dal fondo e le allinea. `turista.py` e `ladro.py` non partono da
un'immagine: **derivano da `hero.png`** cambiando il guardaroba, quindi
vanno rigenerati dopo di lui. Lo script `rigenera.sh` rispetta l'ordine.

## Aggiungere un'immagine nuova

1. Il file in `assets-sorgente/`, con un nome che dica cos'e'.
2. Uno script in `scripts/asset/` che importa `sorgente()` e
   `destinazione()` da `comune.py`.
3. Il nome dello script nell'elenco dentro `rigenera.sh`.
