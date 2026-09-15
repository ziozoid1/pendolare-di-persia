# /task — Ciclo completo di un task GitHub

Esegui il ciclo completo per la issue il cui numero è passato come argomento (`$ARGUMENTS`).

## Passi

1. **Leggi la issue**
   ```
   gh issue view $ARGUMENTS
   ```
   Ricava: titolo, descrizione, branch suggerito (riga `Branch: ...`), etichette.

2. **Crea il branch**
   Usa il nome branch dalla issue (riga `Branch: feat/...`).
   Se manca, derivalo dal titolo in kebab-case con il prefisso appropriato
   (`feat/`, `fix/`, `chore/`, `design/`).
   ```
   git checkout main
   git pull
   git checkout -b <branch>
   ```

3. **Implementa**
   Segui esattamente i "Da fare" e i "Criteri di accettazione" della issue.
   Rispetta i vincoli di CLAUDE.md (se esiste) e quelli in calce alla issue.
   Verifica con `npm run build` prima di procedere.

4. **Commit**
   ```
   git add <solo i file toccati>
   git commit -m "<tipo>: <titolo breve>"
   ```
   Non usare `git add -A`. Non committare file non richiesti dal task.

5. **Push e PR**
   ```
   git push -u origin <branch>
   gh pr create \
     --title "<titolo issue>" \
     --body "Closes #$ARGUMENTS" \
     --base main
   ```

6. **Aspetta conferma**
   Mostra l'URL della PR e fermati. Non mergiare senza ok esplicito dell'utente.

7. **Merge e chiusura** (solo dopo ok)
   ```
   gh pr merge --squash --delete-branch
   gh issue close $ARGUMENTS --comment "Risolto in <PR URL>."
   git checkout main
   git pull
   ```

## Note

- Se la issue richiede lavoro di design o decisioni aperte, fermati al punto 3
  e chiedi prima di scrivere codice.
- Se `npm run build` fallisce dopo l'implementazione, risolvi il problema prima
  del commit — non aprire una PR che non builda.
- Il merge è sempre squash: un solo commit per task su `main`.
