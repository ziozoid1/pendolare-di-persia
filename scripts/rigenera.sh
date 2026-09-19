#!/usr/bin/env bash
# Rigenera i PNG del gioco a partire dalle immagini in assets-sorgente/.
# Ogni script scrive direttamente in public/skins/: non c'e' nessun
# passaggio manuale e nessuno zip da applicare.
#
#   ./scripts/rigenera.sh            tutto
#   ./scripts/rigenera.sh stazione   solo quello script
set -euo pipefail
cd "$(dirname "$0")/.."

FILTRO="${1:-}"
FONDALI=(stazione centro-direzionale ascensori capsula centro-storico
         quadri-semplici titolo mappa nuvole)
PERSONAGGI=(hero seller turista ladro impiegati gatto topo)

esegui() {
  local nome="$1" percorso="$2"
  if [ -n "$FILTRO" ] && [[ "$nome" != *"$FILTRO"* ]]; then return; fi
  echo "-- $nome"
  ( cd scripts/asset && python3 "$percorso" ) || { echo "   FALLITO"; return 1; }
}

echo "== Fondali e schermate =="
for s in "${FONDALI[@]}"; do esegui "$s" "$s.py"; done

echo
echo "== Personaggi =="
echo "   (dipendono l'uno dall'altro: turista e ladro derivano da hero)"
for s in "${PERSONAGGI[@]}"; do esegui "$s" "personaggi/$s.py"; done

echo
echo "Fatto. Ricorda Cmd+Shift+R nel browser."
