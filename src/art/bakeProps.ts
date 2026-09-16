import { makeCanvas, rect, toDataURL, line } from "./pixel";
import { EGA } from "./palettes";
import { GROUND_Y } from "../core/constants";

/**
 * Oggetti di scena e fondali cotti a codice. Ogni voce ha una chiave stabile:
 * uno skin esterno puo' sovrascrivere la stessa chiave con un PNG e il gioco
 * non se ne accorge.
 */
export interface BakedProp {
  key: string;
  dataURL: string;
  width: number;
  height: number;
}

function prop(key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): BakedProp {
  const { canvas, ctx } = makeCanvas(w, h);
  paint(ctx);
  return { key, dataURL: toDataURL(canvas), width: w, height: h };
}

/** Un pixel di colore pieno, scalato all'uso: evita del tutto il sistema di tint. */
export function bakeSolid(key: string, color: string): BakedProp {
  return prop(key, 1, 1, (ctx) => rect(ctx, 0, 0, 1, 1, color));
}

export function bakeStationProps(): BakedProp[] {
  return [
    // --- valigia / transenna -------------------------------------------------
    prop("prop:suitcase", 13, 14, (ctx) => {
      rect(ctx, 5, 0, 3, 3, EGA.dgray);
      rect(ctx, 0, 3, 13, 11, EGA.brown);
      rect(ctx, 0, 3, 13, 1, "#cc7722");
      rect(ctx, 0, 13, 13, 1, EGA.black);
      rect(ctx, 2, 7, 9, 1, EGA.black);
    }),

    // --- treno di sfondo ----------------------------------------------------
    prop("prop:train", 170, 24, (ctx) => {
      rect(ctx, 0, 0, 170, 22, "#3a3a52");
      rect(ctx, 0, 0, 170, 4, "#55557a");
      rect(ctx, 0, 18, 170, 4, "#22223a");
      for (let i = 0; i < 7; i++) rect(ctx, 8 + i * 23, 6, 14, 8, "#7a9ac0");
      rect(ctx, 0, 22, 170, 2, EGA.black);
      rect(ctx, 4, 10, 3, 3, EGA.lred);
    }),

    // --- colonna della galleria (piastrellabile in orizzontale) -------------
    prop("prop:column", 150, 76, (ctx) => {
      rect(ctx, 40, 4, 10, 72, "#20203c");
      rect(ctx, 38, 0, 14, 5, "#2c2c50");
      rect(ctx, 41, 4, 2, 72, "#2c2c50");
    }),

    // --- capriate della pensilina (piastrellabili) --------------------------
    prop("prop:canopy", 60, 26, (ctx) => {
      rect(ctx, 0, 0, 60, 4, "#2a2a4a");
      line(ctx, 0, 4, 14, 26, "#2a2a4a", 2);
      line(ctx, 14, 4, 0, 26, "#2a2a4a", 2);
    }),

    // --- lucernari del soffitto (piastrellabili) ---------------------------
    prop("prop:skylights", 40, 34, (ctx) => {
      rect(ctx, 0, 0, 40, 34, "#1a1a3a");
      rect(ctx, 4, 6, 22, 9, "#3a3a6a");
      rect(ctx, 6, 8, 18, 5, "#5555aa");
    }),

    // --- pavimento a mattonelle (piastrellabile) ---------------------------
    prop("prop:floor", 16, 32, (ctx) => {
      rect(ctx, 0, 0, 16, 32, "#2e2e42");
      rect(ctx, 0, 0, 16, 2, "#4a4a66");
      rect(ctx, 0, 2, 1, 30, "#26263a");
      rect(ctx, 0, 10, 16, 1, "#26263a");
      rect(ctx, 0, 18, 16, 1, "#26263a");
      rect(ctx, 0, 26, 16, 1, "#26263a");
    }),

    // --- parete di fondo (piastrellabile) ----------------------------------
    prop("prop:backwall", 16, 56, (ctx) => {
      rect(ctx, 0, 0, 16, 56, "#1c1c38");
      rect(ctx, 0, 0, 16, 1, "#26264a");
    }),

    // --- banchetto del venditore ------------------------------------------
    prop("prop:stall", 18, 14, (ctx) => {
      rect(ctx, 0, 0, 18, 2, "#cc7722");
      rect(ctx, 2, 2, 14, 12, EGA.brown);
    }),

    // --- varco di uscita verso il Centro Direzionale -----------------------
    prop("prop:exit", 38, 60, (ctx) => {
      rect(ctx, 0, 2, 38, 58, "#0a0a18");
      rect(ctx, 0, 0, 38, 3, EGA.dgray);
      rect(ctx, 3, 40, 32, 1, "#14142a");
    })
  ];
}

/**
 * Tabellone delle partenze. Due varianti alternate danno il lampeggio del
 * treno in ritardo senza scomodare un oggetto testo.
 */
export function bakeBoard(blink: boolean): BakedProp {
  const rows = [
    "NAPOLI C.LE  08:41  BIN 14",
    "SALERNO      08:47  BIN  7",
    "CASERTA      RITARD.  ***"
  ];
  return prop(blink ? "prop:board_on" : "prop:board_off", 96, 20, (ctx) => {
    rect(ctx, 0, 0, 96, 20, EGA.black);
    rect(ctx, 0, 0, 96, 1, EGA.dgray);
    ctx.font = "6px ui-monospace, monospace";
    ctx.textBaseline = "top";
    rows.forEach((r, i) => {
      ctx.fillStyle = i === 2 && !blink ? EGA.brown : EGA.yellow;
      ctx.fillText(r, 3, 2 + i * 6);
    });
  });
}

/**
 * STAGE 3 - atrio della Torre Saverio.
 * Marmo freddo, luci al soffitto, due porte d'ascensore.
 */
export function bakeLobbyProps(): BakedProp[] {
  const marble = "#3a3a4e";
  const marbleLight = "#4e4e66";
  const steel = "#6a6a80";

  return [
    // parete di marmo (piastrellabile)
    prop("prop:lobby_wall", 24, 120, (ctx) => {
      rect(ctx, 0, 0, 24, 120, marble);
      rect(ctx, 0, 0, 1, 120, marbleLight);
      rect(ctx, 0, 40, 24, 1, "#32324a");
      rect(ctx, 0, 41, 24, 1, marbleLight);
      rect(ctx, 12, 41, 1, 79, "#32324a");
    }),

    // soffitto con plafoniere (piastrellabile)
    prop("prop:lobby_ceiling", 48, 30, (ctx) => {
      rect(ctx, 0, 0, 48, 30, "#22223a");
      rect(ctx, 0, 27, 48, 3, "#2c2c48");
      rect(ctx, 10, 6, 28, 4, steel);
      rect(ctx, 12, 7, 24, 2, "#ffff55");
    }),

    // pavimento lucido (piastrellabile)
    prop("prop:lobby_floor", 24, 32, (ctx) => {
      rect(ctx, 0, 0, 24, 32, "#34344a");
      rect(ctx, 0, 0, 24, 2, steel);
      rect(ctx, 0, 2, 24, 4, "#3e3e58");
      rect(ctx, 0, 2, 1, 30, "#2a2a3e");
      rect(ctx, 12, 2, 1, 30, "#2a2a3e");
    }),

    // porta chiusa
    prop("prop:lift_closed", 30, 54, (ctx) => {
      rect(ctx, 0, 0, 30, 54, steel);
      rect(ctx, 2, 2, 26, 52, "#8a8aa0");
      rect(ctx, 2, 2, 26, 1, EGA.white);
      rect(ctx, 14, 2, 2, 52, "#55556e");
      rect(ctx, 4, 24, 4, 1, "#55556e");
      rect(ctx, 22, 24, 4, 1, "#55556e");
    }),

    // porta aperta: si vede la cabina
    prop("prop:lift_open", 30, 54, (ctx) => {
      rect(ctx, 0, 0, 30, 54, steel);
      rect(ctx, 2, 2, 26, 52, "#14141f");
      rect(ctx, 6, 4, 18, 2, "#ffff55");
      rect(ctx, 4, 8, 22, 40, "#1e1e2e");
      rect(ctx, 4, 46, 22, 2, "#2a2a3e");
      rect(ctx, 2, 2, 3, 52, "#8a8aa0");
      rect(ctx, 25, 2, 3, 52, "#8a8aa0");
    }),

    // display del piano sopra la porta
    prop("prop:lift_panel", 30, 9, (ctx) => {
      rect(ctx, 0, 0, 30, 9, EGA.black);
      rect(ctx, 0, 0, 30, 1, steel);
    }),

    // impronte a terra: segnano il tuo posto in fila
    prop("prop:queue_mark", 11, 4, (ctx) => {
      rect(ctx, 0, 1, 4, 3, "#55ff55");
      rect(ctx, 7, 1, 4, 3, "#55ff55");
      rect(ctx, 0, 0, 4, 1, "#00aa00");
      rect(ctx, 7, 0, 4, 1, "#00aa00");
    }),

    // pianta ornamentale d'ordinanza
    prop("prop:plant", 14, 26, (ctx) => {
      rect(ctx, 4, 18, 6, 8, EGA.brown);
      rect(ctx, 3, 17, 8, 2, "#cc7722");
      rect(ctx, 6, 8, 2, 10, "#006622");
      for (const [x, y, w, h] of [[1, 6, 5, 2], [8, 4, 5, 2], [2, 10, 4, 2], [8, 9, 5, 2], [4, 2, 6, 2]] as Array<[number, number, number, number]>) {
        rect(ctx, x, y, w, h, EGA.green);
      }
      rect(ctx, 5, 0, 4, 3, "#55aa33");
    })
  ];
}

/**
 * STAGE 1 (stile falso-3D alla Prince of Persia 1989).
 * Palette calda sabbiosa, colonne con faccia laterale larga, archi profondi.
 * Nessuna parallasse: tutto in world space (scrollFactor 1 di default).
 */
export function bakeSlabProps(): BakedProp[] {
  const FACE_H = 28; // GAME_H(200) - GROUND_Y(168) - slab_top(4)

  // Palette pietra calda ispirata a PoP 1989
  const HI  = "#cccc99"; // highlight (bordo illuminato)
  const MID = "#887755"; // tono medio della pietra
  const SHD = "#554433"; // ombra calda
  const DRK = "#221100"; // ombra profonda / interno arco

  return [
    // Faccia superiore del piano: pietra illuminata dall'alto
    prop("prop:slab_top", 32, 4, (ctx) => {
      rect(ctx, 0, 0, 32, 1, HI);
      rect(ctx, 0, 1, 32, 2, MID);
      rect(ctx, 0, 3, 32, 1, SHD);
    }),

    // Faccia frontale: corsi di blocchi sfalsati, tre toni caldi
    prop("prop:slab_face", 32, FACE_H, (ctx) => {
      rect(ctx, 0, 0, 32, FACE_H, MID);
      for (let row = 0; row < 4; row++) {
        const y = row * 9;
        if (y >= FACE_H) break;
        const off = row % 2 === 0 ? 0 : 16;
        rect(ctx, 0, y, 32, 1, HI);                                              // highlight orizzontale
        rect(ctx, off, y + 1, 15, 1, HI);                                        // spigolo alto blocco A
        rect(ctx, (off + 16) % 32, y + 1, 15, 1, HI);                           // spigolo alto blocco B
        rect(ctx, 0, Math.min(y + 7, FACE_H - 1), 32, 1, DRK);                  // ombra inferiore
        rect(ctx, off + 15, y + 1, 1, Math.min(7, FACE_H - y - 1), EGA.black);  // giunto verticale
      }
    }),

    // Colonna: faccia frontale (16 px) + faccia laterale destra larga (10 px)
    // La larghezza della faccia laterale e' il segnale di 3D piu' forte.
    prop("prop:pillar", 26, GROUND_Y, (ctx) => {
      // Faccia frontale
      rect(ctx, 0, 0, 16, GROUND_Y, MID);
      rect(ctx, 0, 0, 1, GROUND_Y, HI);             // bordo sinistro illuminato
      rect(ctx, 14, 0, 2, GROUND_Y, SHD);           // bordo destro in ombra (gira l'angolo)
      // Capitello
      rect(ctx, 0, 0, 16, 1, HI);
      rect(ctx, 0, 1, 16, 3, MID);
      rect(ctx, 1, 2, 14, 1, HI);                   // linea orizzontale del capitello
      // Base
      rect(ctx, 0, GROUND_Y - 4, 16, 1, HI);
      rect(ctx, 0, GROUND_Y - 3, 16, 3, MID);
      // Faccia laterale destra (10 px): molto piu' scura, da' la sensazione di volume
      rect(ctx, 16, 0, 10, GROUND_Y, DRK);
      rect(ctx, 16, 0, 10, 4, SHD);                 // raccordo capitello lato
      rect(ctx, 16, GROUND_Y - 4, 10, 4, SHD);      // raccordo base lato
    }),

    // Arco nella parete di fondo con strombatura profonda (prospettiva forzata)
    prop("prop:arch", 64, 96, (ctx) => {
      // Piediritti laterali (visibili in luce)
      rect(ctx, 0, 0, 9, 96, MID);
      rect(ctx, 0, 0, 1, 96, HI);                   // bordo lit
      rect(ctx, 55, 0, 9, 96, MID);
      // Architrave
      rect(ctx, 0, 0, 64, 11, MID);
      rect(ctx, 0, 0, 64, 1, HI);
      // Strombatura sinistra: parete laterale che si vede dentro l'arco
      // Va da x=9 a x=15, piu' larga in alto (prospettiva verso il fondo)
      rect(ctx, 9, 11, 6, 85, SHD);
      rect(ctx, 9, 11, 6, 4, DRK);                  // angolo interno: piu' scuro
      // Strombatura destra (speculare, lato ombra: piu' scura)
      rect(ctx, 49, 11, 6, 85, DRK);
      // Strombatura alta (soffitto interno dell'arco)
      rect(ctx, 9, 11, 46, 5, DRK);
      // Interno: nero profondo, nessun dettaglio (occhio cade nel vuoto)
      rect(ctx, 15, 16, 34, 80, EGA.black);
    }),

    // Lesena: pilastro piatto addossato alla parete, piano intermedio di profondita'
    prop("prop:lesena", 10, GROUND_Y, (ctx) => {
      rect(ctx, 0, 0, 8, GROUND_Y, SHD);
      rect(ctx, 0, 0, 1, GROUND_Y, MID);            // bordo lit
      rect(ctx, 8, 2, 2, GROUND_Y - 4, DRK);        // spigolo laterale
    })
  ];
}
