#!/usr/bin/env bash
# Applica una consegna scaricata, ovunque tu l'abbia salvata.
#
#   ./scripts/applica.sh                    cerca lo zip piu' recente
#   ./scripts/applica.sh mappa              filtra per nome
#   ./scripts/applica.sh ~/percorso/x.zip   percorso esplicito, anche
#                                           trascinando il file nel terminale
set -euo pipefail
cd "$(dirname "$0")/.."
ARG="${1:-}"

if [ -n "$ARG" ] && [ -f "$ARG" ]; then
  ZIP="$ARG"
else
  echo "== Cerco lo zip piu' recente nella tua home =="
  ZIP=$(find "$HOME" -maxdepth 5 -name "*${ARG}*.zip" -type f -mtime -3 \
          -not -path "*/Library/*" -not -path "*/node_modules/*" \
          -not -path "*/.git/*" 2>/dev/null \
        | xargs -I{} stat -f "%m %N" {} 2>/dev/null \
        | sort -rn | head -1 | cut -d' ' -f2-)
  [ -z "$ZIP" ] && { echo "Nessuno zip trovato negli ultimi 3 giorni."; exit 1; }
fi

echo "   $ZIP"
echo "   scaricato: $(stat -f '%Sm' "$ZIP")"

if ! unzip -l "$ZIP" | grep -qE ' (public/|src/|docs/|scripts/|assets-sorgente/|TASK\.md)'; then
  echo; echo "ATTENZIONE: non sembra una consegna, dentro non c'e' nessun percorso del repo."
  unzip -l "$ZIP" | head -20; exit 1
fi

echo; echo "== Scompatto =="
unzip -o "$ZIP" -d . | grep -E 'inflating|extracting' | sed 's/^ */   /'
echo; echo "== Cosa e' cambiato =="
git status --short

if [ -f TASK.md ]; then
  echo; echo "== C'e' una specifica da eseguire =="
  head -3 TASK.md | sed 's/^/   /'
  echo; echo "   claude    e poi:  Leggi ./TASK.md ed esegui la specifica che contiene."
fi
echo; echo "Ricorda Cmd+Shift+R: i PNG in public/ restano nella cache del browser."
