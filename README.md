# Il Pendolare di Persia

![Screenshot del gioco: il protagonista sulla banchina di Napoli Centrale](https://github.com/user-attachments/assets/03fdda0a-6caf-43bb-bb01-5ac0b96b6def)

Platform a schermate fisse in stile Prince of Persia 1989. Un impiegato della
TECNU-CARE deve arrivare dal treno a Piazza Garibaldi alla propria postazione
al 32esimo piano della Torre Saverio, al Centro Direzionale di Napoli.

Vite + TypeScript + Phaser 4. Risoluzione interna 320x200, palette EGA a 16
colori, camera che salta di una schermata alla volta.

## Avvio

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # controllo dei tipi + build statica in dist/
    npm run preview

`base: "./"` in `vite.config.ts` rende `dist/` pubblicabile anche in una
sottocartella, quindi GitHub Pages, Netlify o Vercel funzionano senza
configurazione.

## Comandi di gioco

Frecce per muoversi, shift per correre, su o spazio per saltare, giu' per
stringere la borsa al petto quando il ladro allunga la mano, R per ricominciare
lo stage.

**N e' il tasto della parola.** Serve per dire "no grazie" ai venditori dello
stage 1 e "c'e' la fila" a chi prova a scavalcarti nello stage 3: stessa
grammatica, il posto della spada nel PoP originale.

## Come e' fatto

    src/
      core/          costanti (risoluzione, fisica, profondita') e tipi
      art/
        rig.ts       scheletro umano procedurale: angoli keyframe per posa
        clips.ts     CONTRATTO di animazione condiviso da rig e immagini
        bakeActors   cuoce le 17 pose in uno spritesheet (data URL)
        bakeProps    valigie, treni, colonne, tabellone, pavimento
        atlas.ts     risolve ogni attore: foglio cotto o PNG dello skin
        skin.ts      formato di skin.json
        backdrop/    fondale procedurale oppure a livelli di immagini
      entities/      un file per tipo di ostacolo, piu' un registry
      player/        macchina a stati e controlli
      ui/            HUD, trattativa, pannelli
      levels/        i dati dei livelli, senza logica
      scenes/        Boot, Titolo, StageScene (base) e gli stage

### Il punto chiave: lo stile e' un asset, non codice

Il rig procedurale **non disegna durante il gioco**. A boot cuoce uno
spritesheet e lo passa al loader come data URL. Per il resto del gioco e'
indistinguibile da un PNG su disco:

    rig procedurale ─┐
                     ├─► load.spritesheet() ─► animazioni ─► gioco
    PNG dello skin ──┘

Quindi cambiare stile vuol dire aggiungere una cartella in `public/skins/` e
aprire `?skin=nome`. Niente rifattorizzazioni, e i due stili si confrontano
ricaricando la pagina. Il formato e' documentato in
[public/skins/README.md](public/skins/README.md).

Se mi mandi delle immagini, servono in una di queste due forme:

1. **Uno spritesheet per personaggio** nell'ordine canonico delle 17 pose
   (tabella nel README degli skin). Lo aggancio scrivendo solo `skin.json`.
2. **Qualche posa di riferimento** (fermo, camminata, salto) o anche un solo
   disegno del personaggio: ricostruisco le pose mancanti e produco il foglio
   completo nella griglia giusta.

Per i fondali basta un'immagine per piano di profondita' (cielo/soffitto,
pensilina, parete di fondo, pavimento), ripetibile in orizzontale.

### Tre scelte che tengono il look del 1989

1. **Scala solo intera.** `integerZoom()` in `main.ts`. Un fattore frazionario
   rende le righe di pixel di larghezza diversa anche con filtro nearest.
2. **Camera a schermate fisse.** `StageScene` fa `setScroll(schermata * 320)`.
   Niente inseguimento morbido: e' meta' dell'identita' visiva dell'originale.
3. **Animazione legata al movimento.** `Player.play()` regola `timeScale`
   dell'animazione sulla velocita', cosi' i piedi non slittano. Per la versione
   integrale del PoP (dove e' il frame a decidere lo spostamento) si ascolta
   `ANIMATION_UPDATE` e si muove il corpo di uno scarto per frame invece di
   usare la velocita'.

### Lo stage 3 e come non e' un platform

Negli ascensori il verbo non e' avanzare: e' **restare**. Il posto in fila e'
uno slot, e davanti allo slot c'e' un muro morbido, quindi superarlo e'
impossibile: se provi a passare davanti a chi aspetta, la fila protesta e
perdi pazienza. La fila avanza da sola quando una cabina si riempie, e tu devi
seguirla entro 12 px, altrimenti in 1,3 secondi il posto e' di un altro.

Tutto sta in `entities/ElevatorHall.ts`, che modella la fila come un array
ordinato dove uno degli elementi e' la stringa `"player"`. Da li' vengono
gratis tutte le operazioni: imbarco (`splice(0, capienza)`), scavalcamento
(`splice(slot, 0, tizio)`), nuovi arrivi (`push`), posto perso
(`splice(slot, 1)`). La posizione sullo schermo di ognuno e' solo
`frontX - indice * 13`.

Le cabine hanno una sequenza di capienze fissa (`CAPACITY_SEQUENCE`), zero
compreso: una cabina piena non e' un guasto, e' il gioco.

Gli stage a stanza non hanno una distanza da misurare, quindi la barra della
HUD si reinterpreta: un'entita' chiama `host.setObjective(0..1, "IN FILA: 3°")`
e `StageScene` usa quello invece della distanza dall'uscita.

### Aggiungere uno stage

1. Un file in `levels/` con le entita' e i segmenti di pavimento. **I varchi
   tra i segmenti sono le buche**: con un salto si coprono circa 45 px, quindi
   36-40 px sono passabili di corsa e puniscono chi cammina.
2. Una sottoclasse di `StageScene` con il solo campo `def`.
3. La scena in `main.ts` e il campo `next` dello stage precedente.

### Aggiungere un ostacolo

Una classe in `entities/` che estende `Entity` (`create`, `update`, `destroy`) e
una riga in `entities/registry.ts`. L'entita' parla con lo stage tramite
`StageHost`: `hurt`, `lose`, `say`, `startEncounter`, `completeStage`.

## Stato

| Stage | Stato |
|-------|-------|
| 1. Piazza Garibaldi | completo: venditori, ladri, turisti, valigie, uscita |
| 2. Centro Direzionale | scheletro giocabile: buche vere, transenne, un ladro |
| 3. Gli ascensori | da fare: entita' coda, cabine con capienza |
| 4. Il badge | da fare: grafo di stanze con stato sui documenti |
| 5. La postazione | da fare: scrivanie a tempo, colleghi concorrenti |
| Finale | da fare: dialogo a comparsa, taglio a nero |

Le note di progettazione dei tre stage centrali sono a schermo nelle scene
segnaposto (`scenes/SoonScene.ts`).

## Note su Phaser 4

Il codice evita di proposito le aree toccate dalla migrazione da v3: niente
pipeline, niente FX o maschere, niente shader, e nessun uso del sistema di
tint. I colori piatti della UI sono texture 1x1 scalate (`SOLID` in
`art/atlas.ts`), che funzionano identiche in v3 e v4.
