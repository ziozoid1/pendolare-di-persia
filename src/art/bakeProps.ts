import { makeCanvas, rect, toDataURL, line } from "./pixel";
import { EGA } from "./palettes";

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
