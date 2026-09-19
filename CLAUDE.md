# Da aggiungere a CLAUDE.md

Queste sono le regole che finora venivano ripetute a mano in ogni prompt.
Stando qui, Claude Code le legge da solo a ogni sessione e non serve piu'
scriverle.

---

## Regole permanenti di lavorazione

**Gli asset non si creano mai.** PNG, immagini, suoni e font non si
disegnano, non si generano e non si sostituiscono con versioni procedurali.
Arrivano da fuori e vivono in `public/skins/`. Se un file dichiarato in uno
skin manca, o un modulo importato non esiste: **fermati e chiedi**. Non
disegnarlo a codice come ripiego. `Cannot find module` ha due soluzioni
opposte, e quella rapida e' quella sbagliata.

**Un task, un branch, una PR, uno scopo.** Se un file non c'entra con il
task in corso, non si tocca.

**Mai riformattare** file che il task non richiede. Nessun formattatore sul
progetto intero. Il diff deve restare leggibile a occhio.

**Mai allentare i tipi.** Niente modifiche a `tsconfig.json`, niente
`as any` per far tacere un errore. Se e' davvero l'unica via, commenta il
perche' nel codice.

**Niente API toccate dalla migrazione a Phaser 4**: nessuna pipeline, FX,
maschera, shader, e nessun uso del sistema di tint. I colori pieni sono
texture 1x1 scalate.

**`npm run build` deve passare** prima di considerare finito un task.

**Le consegne arrivano come pacchetto.** Uno zip scompattato dalla radice
del repo porta i file gia' al posto giusto e contiene un `TASK.md` con la
specifica. Leggi quello: contiene misure e coordinate gia' verificate, che
non vanno ricalcolate a occhio.

**I numeri da tarare stanno in cima al file**, non sparsi nel codice:
tolleranze, tempi, velocita'. Servono a chi prova il gioco col dito, e
cambiarli non deve richiedere di rileggere la logica.

**La HUD si crea prima delle entita'** in `StageScene.create()`: un'entita'
puo' parlare gia' nel proprio `create()`, e se la HUD non esiste la scena
crasha. E' successo davvero.

**Il rig vive in `src/art/rig.ts`**, cella 32x44, 17 pose. Se un task sembra
richiedere di spostarlo, ridurlo o sostituirlo: fermati e chiedi.

**Le chiavi di texture devono includere il nome dello skin.** Due skin
diversi possono contenere file con lo stesso nome, e Phaser non sostituisce
una texture gia' in cache: il secondo caricamento viene ignorato in
silenzio, e a schermo compare l'immagine sbagliata. Non da' errori e non
rompe la build, quindi e' fra i guasti piu' difficili da diagnosticare.

**I PNG in `public/skins/` non si modificano a mano: sono generati.**
Per cambiare un'immagine si modifica lo script corrispondente in
`scripts/asset/` e si rigenera. Se serve un disegno nuovo, quello
arriva da fuori e va in `assets-sorgente/`.

## Comandi della pipeline immagini

```
./scripts/rigenera.sh [nome]   rigenera i PNG da assets-sorgente/
./scripts/applica.sh [nome]    applica una consegna scaricata
./scripts/verifica.sh          controlla che skin e livelli combacino
```
