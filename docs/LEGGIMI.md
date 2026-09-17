# Fondale del Centro Direzionale (stage 2)

Ricavato dall'immagine di riferimento, scalata a 303x200. I passanti disegnati
hanno i piedi a y=568 nell'originale: a questa scala quella quota cade
esattamente su GROUND_Y=168, quindi il protagonista cammina dove cammina la
gente nel disegno.

Due piani, tagliati dove i palazzi incontrano le fioriere:

| file | y | altezza | scorrimento |
|------|---|---------|-------------|
| `citta.png` | 0 | 142 | 0.45, la citta' lontana scorre piu' lenta |
| `piazza.png` | 139 | 61 | 1, ancorata al mondo |

Il piano basso si sovrappone di 3 px a quello alto, cosi' la parallasse non
apre una fessura sul taglio.

`hero.png` e' lo stesso foglio dello skin garibaldi2: va replicato qui perche'
ogni skin e' autonomo.

## Nota sul gatto e sul topo

Sono ancora cotti dentro `piazza.png`. Quando faremo gli attori di fondale
animati vanno tolti da li' e rifatti come sprite a se', altrimenti si vedranno
doppi: uno fermo e uno in movimento.

## Limite noto

Il fondale si ripete ogni 303 px, cioe' poco meno di una schermata. Su uno
stage largo 1920 si ripete sei volte e mezzo, e i due lampioni ai lati sono
l'elemento che si nota di piu'.
