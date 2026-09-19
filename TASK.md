# Pipeline delle immagini dentro il repository

Da questa consegna, i PNG del gioco si rigenerano dal repository: non
arrivano piu' come file da sostituire a mano.

## Cosa contiene la consegna

- `assets-sorgente/` — le immagini originali da cui derivano tutti i PNG
- `scripts/asset/` — gli script che le trasformano (Python + Pillow)
- `scripts/rigenera.sh` — li esegue tutti, o solo quello indicato
- `scripts/applica.sh` — applica una consegna scaricata
- `scripts/verifica.sh` — controlla che skin e livelli combacino
- `docs/pipeline-immagini.md` — come funziona

## Cosa fare

1. Verifica che `python3 -c "import PIL"` funzioni; se manca,
   `pip3 install Pillow`.
2. Esegui `./scripts/rigenera.sh` e controlla che rigeneri i PNG senza
   errori e che il gioco resti identico a prima.
3. Esegui `./scripts/verifica.sh` e sistema quello che segnala.
4. Aggiungi a `CLAUDE.md`, nella sezione dei comandi:

```
./scripts/rigenera.sh [nome]   rigenera i PNG da assets-sorgente/
./scripts/applica.sh [nome]    applica una consegna scaricata
./scripts/verifica.sh          controlla che skin e livelli combacino
```

   e questa regola:

   **I PNG in `public/skins/` non si modificano a mano: sono generati.**
   Per cambiare un'immagine si modifica lo script corrispondente in
   `scripts/asset/` e si rigenera. Se serve un disegno nuovo, quello
   arriva da fuori e va in `assets-sorgente/`.

5. Committa `assets-sorgente/` nel repository: sono 9 MB una volta sola, e
   senza di loro la pipeline non e' riproducibile.

Branch: `feat/pipeline-immagini`
