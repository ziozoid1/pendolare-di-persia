#!/usr/bin/env bash
# Controlla che skin e livelli combacino. Intercetta la classe di errori
# che non danno ne' crash ne' errori di compilazione, e che quindi si
# scoprono solo guardando lo schermo: chiavi che non corrispondono,
# immagini dichiarate ma assenti, nomi di file ripetuti fra skin diversi.
set -uo pipefail
cd "$(dirname "$0")/.."
ERRORI=0

echo "== Fondali richiesti dai livelli =="
for f in src/levels/*.ts; do
  BD=$(grep -o 'backdrop: *"[^"]*"' "$f" | sed 's/.*"\(.*\)"/\1/')
  SK=$(grep -o 'skin: *"[^"]*"' "$f" | sed 's/.*"\(.*\)"/\1/')
  [ -z "$BD" ] && continue
  if [ -n "$SK" ]; then
    MANIFEST="public/skins/$SK/skin.json"
    if [ ! -f "$MANIFEST" ]; then
      echo "   MANCA  $(basename "$f"): skin \"$SK\" non esiste"; ERRORI=$((ERRORI+1)); continue
    fi
    if grep -q "\"$BD\"" "$MANIFEST"; then
      echo "   ok     $(basename "$f"): $SK -> $BD"
    else
      echo "   ERRORE $(basename "$f"): chiede \"$BD\" ma $SK non lo dichiara"; ERRORI=$((ERRORI+1))
    fi
  else
    echo "   ok     $(basename "$f"): $BD (skin globale)"
  fi
done

echo
echo "== Immagini dichiarate ma assenti =="
for m in public/skins/*/skin.json; do
  D=$(dirname "$m")
  for img in $(grep -o '"[^"]*\.png"' "$m" | tr -d '"' | sort -u); do
    if [ ! -f "$D/$img" ]; then
      echo "   MANCA  $D/$img"; ERRORI=$((ERRORI+1))
    fi
  done
done
[ $ERRORI -eq 0 ] && echo "   nessuna"

echo
echo "== Nomi di file ripetuti fra skin diversi =="
echo "   (non e' un errore, ma le chiavi di texture devono includere lo skin)"
find public/skins -name "*.png" -exec basename {} \; | sort | uniq -d | sed 's/^/   /'

echo
if [ $ERRORI -gt 0 ]; then
  echo "$ERRORI problemi da sistemare."
  exit 1
fi
echo "Tutto coerente."
