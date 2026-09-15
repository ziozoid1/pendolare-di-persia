#!/usr/bin/env bash
# Crea etichette, milestone e issue del progetto Pendolare di Persia.
# Da eseguire una volta sola, dalla radice del repo, con la GitHub CLI autenticata:
#   chmod +x setup-issues.sh && ./setup-issues.sh
set -euo pipefail

T=$(mktemp -d)
trap 'rm -rf "$T"' EXIT

# ---------- etichette --------------------------------------------------------
echo "== Etichette =="
gh label create "infra"   --color "5319E7" --description "Build, CI, deploy, strumenti"      --force
gh label create "motore"  --color "1D76DB" --description "Sistemi condivisi tra gli stage"   --force
gh label create "grafica" --color "0E8A16" --description "Rig, skin, font, fondali"          --force
gh label create "stage"   --color "FBCA04" --description "Contenuto di un livello"           --force
gh label create "bug"     --color "D73A4A" --description "Qualcosa non funziona"             --force
gh label create "design"  --color "C2E0C6" --description "Da progettare prima di scrivere"   --force

# ---------- milestone --------------------------------------------------------
echo "== Milestone =="
gh api "repos/{owner}/{repo}/milestones" -f title="Fondamenta" \
  -f description="La build passa, le regole sono nel repo, le scritte sono leggibili, gli skin sono verificati." \
  >/dev/null 2>&1 || echo "  (milestone Fondamenta gia presente)"
gh api "repos/{owner}/{repo}/milestones" -f title="Stage" \
  -f description="I cinque stage e il finale, uno alla volta." \
  >/dev/null 2>&1 || echo "  (milestone Stage gia presente)"

# ---------- vincoli comuni ---------------------------------------------------
cat > "$T/vincoli.md" <<'VINCOLI'

---
**Vincoli validi per ogni task**
- Un solo scopo: se un file non c'entra col task, non si tocca.
- Mai riformattare file che il task non richiede. Nessun formattatore sul progetto intero.
- Mai allentare `tsconfig.json`, mai `as any` per far tacere un tipo. Se e' davvero l'unica via, commentare il perche'.
- Rispettare gli invarianti in `CLAUDE.md`.
- `npm run build` deve passare e `npm run dev` deve aprire il gioco prima di chiudere il task.
VINCOLI

# ---------- funzione helper --------------------------------------------------
issue() {
  local title="$1" labels="$2" milestone="$3" body_file="$4"
  cat "$body_file" "$T/vincoli.md" > "$T/full.md"
  gh issue create \
    --title "$title" \
    --label "$labels" \
    --milestone "$milestone" \
    --body-file "$T/full.md" >/dev/null
  echo "  + $title"
}

# ---------- fondamenta -------------------------------------------------------
echo "== Issue: fondamenta =="

cat > "$T/b.md" <<'BODY'
Il commit `8e3045a` aveva rimosso 25 file dall'indice e sostituito il rig procedurale
(32x44, 17 pose) con un personaggio a rettangoli da 12x18 e 14 frame, disallineato dal
contratto di `clips.ts`. Il ripristino e' stato fatto, resta da verificarlo a fondo.

**Da controllare**
- Ogni clip mostra i frame giusti: `run` (6-9) non deve mostrare la camminata, e `push`,
  `offer`, `reach` (14-16) devono esistere e comparire. Il venditore protende il braccio
  con la merce, il ladro allunga la mano.
- `FRAME_W` e `FRAME_H` valgono 32 e 44; `TOTAL_FRAMES` in `clips.ts` vale 17.
- Nessun file usa ancora l'attore `player`: l'identificativo giusto e' `hero`.
- `git ls-files src | wc -l` restituisce 39.
- Il gioco parte da un clone vergine: `git clone`, `npm ci`, `npm run build`, `npm run dev`.

**Criteri di accettazione**
- Le dieci clip di ogni attore sono corrette a schermo, non solo compilate.

Branch: `fix/verifica-rig`
BODY
issue "Verificare che il ripristino del rig sia completo" "bug,grafica" "Fondamenta" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Il file con gli invarianti non e' mai stato committato, ed e' il motivo per cui un fix di
build ha potuto riscrivere il progetto.

**Da fare**
- Aggiungere `CLAUDE.md` nella radice con: comandi, struttura, lingua, invarianti (scala
  solo intera, camera a schermate fisse, palette EGA, nessuna API toccata dalla migrazione
  a Phaser 4, HUD creata prima delle entita', lo stile e' un asset e non codice).
- Aggiungere `docs/decisioni.md`: due righe per ogni scelta di progetto e il perche'.
- Includere queste due regole, nate da un incidente reale:
  - **Se un modulo importato non esiste, non riscriverlo.** Cercalo nella storia di git
    (`git log --diff-filter=D -- percorso`) e fermati a chiedere. `Cannot find module`
    ha due soluzioni opposte e quella rapida e' quella sbagliata.
  - **Il rig vive in `src/art/rig.ts`, cella 32x44, 17 pose.** Se un task sembra
    richiedere di spostarlo, ridurlo o sostituirlo, fermati e chiedi.

**Criteri di accettazione**
- I due file sono su `main`.
- `CLAUDE.md` contiene esplicitamente i tre vincoli di processo: un task un branch, mai
  riformattare fuori scopo, mai allentare i tipi.

Branch: `chore/regole-progetto`
BODY
issue "Regole di progetto: CLAUDE.md nel repo" "infra" "Fondamenta" "$T/b.md"

cat > "$T/b.md" <<'BODY'
**Da fare**
- Workflow in `.github/workflows/deploy.yml`: su push a `main` esegue `npm ci`,
  `npm run build` e pubblica `dist/`.
- Impostare Settings -> Pages -> Source: GitHub Actions (passaggio manuale).

**Note**
- Serve lo scope `workflow` sul token, altrimenti il push del file viene rifiutato:
  `gh auth refresh -s workflow`.
- Non passare il token di GitHub ad action di terze parti che committano, altrimenti
  i workflow non partono sui loro commit.

**Criteri di accettazione**
- Il gioco e' raggiungibile all'URL di Pages e si aggiorna a ogni merge su `main`.

Branch: `chore/pages`
BODY
issue "Deploy automatico su GitHub Pages" "infra" "Fondamenta" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Le scritte sono illeggibili. La causa e' architetturale: `ui/text.ts` usa `add.text` con
un font di sistema a 8px, che non ha una griglia coerente e dipende dal font installato e
dal fattore di scala. Il PoP originale aveva un font proprio disegnato pixel per pixel.

**Da fare**
- Nuovo `src/art/font.ts`: font 5x7 (maiuscole, cifre, punteggiatura, accentate italiane),
  definito come dati e cotto in texture dallo stesso baker degli sprite.
- Riscrivere `src/ui/text.ts` mantenendo **identiche** le firme di `pixelText` e
  `centerText`, cosi' nessun altro file cambia.
- Verificare anche `main.ts`: `pixelArt: true`, `roundPixels: true` e scala solo intera
  devono essere intatti. Un fattore di scala frazionario rende illeggibile il testo.
- Esporre il font come chiave sostituibile via skin, come gli altri asset.

**Criteri di accettazione**
- Le scritte sono nitide a zoom 2x, 3x e 4x, identiche su macchine diverse.
- Nessun uso di `add.text` per la UI di gioco.

Branch: `feat/font-pixel`
BODY
issue "Font pixel disegnato a mano al posto del font di sistema" "grafica,motore" "Fondamenta" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Serve a due cose: dimostrare che il percorso "PNG esterno" funziona, e dare a chi disegna
il file di partenza nella griglia giusta.

**Da fare**
- Parametro URL `?export=1`: a boot scarica un PNG per ogni attore (griglia canonica,
  17 frame in fila) piu' i prop.
- Documentare in `public/skins/README.md`: apri il PNG, ridipingi sopra, salvi, lo
  dichiari in `skin.json`.

**Criteri di accettazione**
- I PNG esportati, rimessi dentro come skin, danno un gioco identico a quello procedurale.

Branch: `feat/export-sheets`
BODY
issue "Esportare in PNG gli spritesheet cotti dal rig" "grafica" "Fondamenta" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Se qualcuno rompe il sistema degli skin per far passare una build, deve rompersi qualcosa
di visibile.

**Da fare**
- `public/skins/prova/` con almeno l'eroe sostituito (basta ridipingere l'export con
  colori diversi) e il relativo `skin.json`.
- Una riga nel README: `?skin=prova` deve mostrare l'eroe alternativo con tutto il resto
  procedurale.

**Criteri di accettazione**
- `?skin=prova` funziona; senza parametro il gioco e' identico a prima.
- Sostituire solo l'eroe non richiede di dichiarare nient'altro.

Branch: `test/skin-prova`
BODY
issue "Skin di prova committata, come verifica del sistema" "grafica" "Fondamenta" "$T/b.md"

# ---------- stage ------------------------------------------------------------
echo "== Issue: stage =="

cat > "$T/b.md" <<'BODY'
Stage a stanza singola (320x200, nessuno scorrimento). Il verbo non e' avanzare, e' **restare**.

**Meccanica**
- La fila e' un array ordinato in cui uno degli elementi e' il giocatore.
  Posizione a schermo: `frontX - indice * 13`. Da questa scelta vengono gratis:
  imbarco `splice(0, capienza)`, scavalcamento `splice(slot, 0, tizio)`,
  nuovo arrivo `push`, posto perso `splice(slot, 1)`.
- Ci si accoda arrivando all'altezza dell'ultimo posto. Impronte a terra segnano il posto.
- Muro morbido davanti al proprio posto: superarlo e' impossibile; provare a passare
  davanti a chi aspetta costa pazienza e fa protestare la fila.
- Tolleranza 12 px dal proprio posto, 1,3 s di grazia: oltre, il posto e' di un altro.
- Due porte, arrivi alternati, capienza da sequenza fissa che include lo zero (cabina
  piena). Quando una cabina si riempie la fila scorre e il giocatore deve seguirla.
- Chi va di fretta arriva da sinistra, si piazza davanti e parla: N entro un secondo e
  mezzo lo rimanda in fondo, altrimenti si infila e il giocatore prende una gomitata.
- Si vince salendo su una cabina mentre si e' tra i primi.

**Struttura**
- Tutto in `src/entities/ElevatorHall.ts`, una riga nel registry, dati in
  `src/levels/stage3.ts`, scena `Stage3Scene`.
- La barra della HUD non misura distanza: serve un gancio `host.setObjective(0..1, label)`
  che `StageScene` usa al posto della distanza dall'uscita. Servira' anche allo stage 5.
- Fondale nuovo "atrio" (marmo, soffitto illuminato, due porte), registrato accanto a
  quello della stazione.
- Numeri da tarare in cima al file, non sparsi: tolleranza, grazia, finestra dello
  scavalcatore, ciclo delle cabine.

**Criteri di accettazione**
- Si puo' perdere per pazienza, per orologio e per posto perso; si vince salendo.
- Tutti i personaggi riusano rig e animazioni esistenti, cambiando solo palette.

Branch: `feat/stage3-ascensori`
BODY
issue "Stage 3 - Gli ascensori" "stage" "Stage" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Oggi ci sono solo buche e transenne. Le buche sono i varchi tra i segmenti di
`StageDef.floor`: un salto copre circa 45 px, quindi 36-40 px si passano di corsa
e puniscono chi cammina.

**Da aggiungere**
- Scale mobili ferme: piano inclinato che si sale a velocita' ridotta.
- Pozzanghere che rallentano e fanno scivolare.
- Cantieri con transenne mobili.
- Vento tra le torri: spinta orizzontale a raffiche.

**Criteri di accettazione**
- Ogni ostacolo e' una classe in `entities/` piu' una riga nel registry; i dati stanno
  in `levels/stage2.ts`.
- Difficolta' crescente da sinistra a destra, e lo stage si completa in circa un minuto
  e mezzo giocando bene.

Branch: `feat/stage2-completo`
BODY
issue "Stage 2 - Centro Direzionale, da scheletro a completo" "stage" "Stage" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Da progettare prima di scrivere codice: e' l'unico stage che non e' un platform.

**Da definire**
- Grafo di stanze (reception, ufficio badge, IT per il permesso di rete, piano del
  manager) con l'ascensore come collegamento.
- Stato sui documenti ottenuti, e prerequisiti incrociati: il badge richiede il modulo
  firmato, il modulo richiede il badge provvisorio.
- Timer di sospetto dei manager che ti vogliono in postazione: cresce col tempo, non
  con gli spostamenti.
- Come si rappresenta un grafo di stanze riusando `StageScene`, o se serve una classe
  sorella.

**Criteri di accettazione**
- Un documento in `docs/` con il grafo, gli stati e le condizioni di vittoria e sconfitta,
  prima di aprire il task di implementazione.

Branch: `design/stage4-badge`
BODY
issue "Stage 4 - Il badge: progettazione" "stage,design" "Stage" "$T/b.md"

cat > "$T/b.md" <<'BODY'
32esimo piano. I posti liberi si esauriscono mentre cerchi.

**Meccanica**
- Ogni scrivania ha un timer di occupazione; i colleghi puntano una scrivania con un
  percorso proprio e si siedono.
- Vince chi si siede prima. La barra della HUD mostra le scrivanie libere rimaste
  (riusa `setObjective`).
- Prese, monitor e vicini rumorosi come criteri: non tutte le scrivanie sono equivalenti.

Branch: `feat/stage5-postazione`
BODY
issue "Stage 5 - La postazione" "stage" "Stage" "$T/b.md"

cat > "$T/b.md" <<'BODY'
Schermata fissa. Il manager si avvicina, sorride e dice: «ma lo sai che potevi fare smart working?»

**Da fare**
- Dialogo a comparsa lettera per lettera, taglio a nero, titoli di coda con l'orario di
  arrivo e le statistiche della partita (pazienza spesa, volte scavalcato, cabine perse).
- Tono comico e affettuoso, mai sarcastico verso le persone.

Branch: `feat/finale`
BODY
issue "Finale - lo smart working" "stage" "Stage" "$T/b.md"

echo
echo "Fatto. Apri le issue con: gh issue list"
