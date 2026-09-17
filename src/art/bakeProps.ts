import { makeCanvas, rect, toDataURL, line } from "./pixel";
import { EGA } from "./palettes";
import { GAME_H, GROUND_Y } from "../core/constants";

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
 * STAGE 3 - atrio della Torre Valerio.
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

/**
 * STAGE 1 v2 - Piazza Garibaldi, stazione di mattoni.
 * Layout verticale (dall'alto): cielo+catenaria (38px), cornice cemento (8px),
 * parete mattoni (74px), pilastri banchina (48px), bordo+striscia gialla (8px),
 * massicciata+binari (24px).
 */
export function bakeGaribaldiProps(): BakedProp[] {
  // Cielo freddo
  const SKY_HI  = "#c0d0e0";
  const SKY_MID = "#96a8bc";
  const WIRE    = "#3a4048";
  const INSUL   = "#8888a0";

  // Mattoni caldi (tre toni esatti come da spec)
  const BR_HI  = "#c88850";
  const BR_MID = "#9a5c2e";
  const BR_DRK = "#5a3018";

  // Cemento / banchina
  const CEM_HI  = "#d0ccc4";
  const CEM_MID = "#a8a49c";
  const CEM_SHD = "#787068";
  const PLAT_HI = "#e0dcc8";
  const PLAT_MID = "#c8c4b0";
  const YELLOW   = "#f0c000";
  const PLAT_SHD = "#a09888";
  const SHADOW   = "#1e1814";

  // Binari
  const BALLAST  = "#504840";
  const GRAVEL_D = "#3a3430";
  const GRAVEL_L = "#686058";
  const SLEEPER  = "#3c2818";
  const RAIL     = "#787080";
  const RAIL_HI  = "#9898b0";

  // Treno
  const TR_BODY  = "#2a3a52";
  const TR_TOP   = "#1e2a3c";
  const TR_WIN   = "#7098b0";
  const TR_DOOR  = "#1a2032";
  const TR_UNDER = "#181828";

  const TRACK_H = GAME_H - GROUND_Y - 8; // 24 px

  return [
    // --- Cielo + catenaria (tileable ogni 80 px, y 0-38) ---
    prop("prop:catenary", 80, 38, (ctx) => {
      rect(ctx, 0, 0, 80, 22, SKY_HI);
      rect(ctx, 0, 22, 80, 16, SKY_MID);
      // Palo: x 38-40
      rect(ctx, 38, 0, 3, 38, WIRE);
      // Traversa sommitale
      rect(ctx, 30, 0, 20, 4, WIRE);
      // Filo portante (y 10) e di contatto (y 26)
      rect(ctx, 0, 10, 80, 1, WIRE);
      rect(ctx, 0, 26, 80, 1, "#505868");
      // Pendolo dal filo portante a quello di contatto
      rect(ctx, 40, 10, 1, 16, "#505868");
      // Isolatore
      rect(ctx, 37, 8, 7, 4, INSUL);
    }),

    // --- Cornice di cemento (fascia, y 38-46) ---
    prop("prop:wall_cornice", 32, 8, (ctx) => {
      rect(ctx, 0, 0, 32, 2, CEM_HI);
      rect(ctx, 0, 2, 32, 4, CEM_MID);
      rect(ctx, 0, 6, 32, 2, CEM_SHD);
    }),

    // --- Parete di mattoni (tileable, 3 toni, y 46-120) ---
    prop("prop:brick_wall", 32, 80, (ctx) => {
      rect(ctx, 0, 0, 32, 80, BR_MID);
      for (let row = 0; row < 10; row++) {
        const y = row * 8;
        if (y >= 80) break;
        const off = row % 2 === 0 ? 0 : 16;
        rect(ctx, 0, y, 32, 1, BR_DRK);                          // giunto orizz.
        rect(ctx, off, y + 1, 14, 6, BR_HI);                     // mattone A
        rect(ctx, (off + 16) % 32, y + 1, 14, 6, BR_HI);        // mattone B
        rect(ctx, off + 14, y + 1, 2, 6, BR_DRK);               // giunto vert. A
        rect(ctx, (off + 30) % 32, y + 1, 2, 6, BR_DRK);        // giunto vert. B
      }
    }),

    // --- Cartellone pubblicitario (frame + manifesto) ---
    prop("prop:billboard", 68, 52, (ctx) => {
      rect(ctx, 0, 0, 68, 52, BR_DRK);           // cornice scura
      rect(ctx, 3, 3, 62, 46, "#d4b060");         // sfondo manifesto caldo
      rect(ctx, 3, 3, 62, 14, "#3878b0");         // cielo stilizzato azzurro
      rect(ctx, 3, 17, 62, 2, "#e08030");         // orizzonte caldo
      rect(ctx, 44, 4, 12, 12, "#ffe030");        // disco sole
      rect(ctx, 46, 6, 8, 8, "#fff080");          // centro sole brillante
      rect(ctx, 8, 10, 10, 20, "#204090");        // sagoma edificio A
      rect(ctx, 20, 14, 6, 16, "#204090");        // sagoma edificio B
      rect(ctx, 3, 40, 62, 1, "#c09050");         // separatore
      rect(ctx, 6, 42, 44, 6, "#b88840");         // banda testo-finto
    }),

    // --- Lampada sopra il cartellone ---
    prop("prop:billboard_lamp", 10, 8, (ctx) => {
      rect(ctx, 4, 0, 2, 4, WIRE);               // staffa
      rect(ctx, 2, 4, 6, 4, "#fff8a0");          // bulbo
      rect(ctx, 3, 5, 4, 2, "#ffffff");           // punto luminoso
    }),

    // --- Cono di luce (usato con setAlpha, NON tint) ---
    prop("prop:light_cone", 22, 32, (ctx) => {
      for (let y = 0; y < 32; y++) {
        const w = Math.round(2 + (y / 31) * 18);
        const x = Math.round((22 - w) / 2);
        rect(ctx, x, y, w, 1, "#fff8c0");
      }
    }),

    // --- Pilastri e zona in ombra banchina (tileable ogni 48 px, y 120-168) ---
    prop("prop:platform_pillar", 48, 48, (ctx) => {
      rect(ctx, 0, 0, 48, 48, SHADOW);           // fondo ombra tettoia
      rect(ctx, 20, 0, 8, 48, "#3a3028");        // corpo pilastro
      rect(ctx, 20, 0, 2, 48, "#4a4038");        // spigolo lit
      rect(ctx, 26, 0, 2, 48, "#221812");        // spigolo in ombra
      rect(ctx, 16, 20, 16, 3, "#302820");       // correa centrale
    }),

    // --- Bordo banchina con striscia gialla di sicurezza (y 168) ---
    prop("prop:platform_edge", 32, 8, (ctx) => {
      rect(ctx, 0, 0, 32, 1, PLAT_HI);          // spigolo superiore lit
      rect(ctx, 0, 1, 32, 3, PLAT_MID);         // lastra
      rect(ctx, 0, 4, 32, 1, YELLOW);            // striscia gialla di sicurezza
      rect(ctx, 0, 5, 32, 3, PLAT_SHD);         // faccia frontale in ombra
    }),

    // --- Massicciata, traversine e rotaie (tileable ogni 64 px) ---
    prop("prop:track_bed", 64, TRACK_H, (ctx) => {
      rect(ctx, 0, 0, 64, TRACK_H, BALLAST);
      // Gravel texture: pietre scure e chiare
      for (const [x, y] of [[4,2],[14,10],[28,15],[44,6],[56,19],[8,20],[36,2]] as Array<[number,number]>)
        rect(ctx, x, y, 2, 2, GRAVEL_D);
      for (const [x, y] of [[10,6],[22,13],[38,18],[52,9],[6,17],[30,5]] as Array<[number,number]>)
        rect(ctx, x, y, 2, 2, GRAVEL_L);
      // Traversine ogni 8 px (4 px di larghezza)
      for (let i = 0; i < 8; i++) {
        rect(ctx, i * 8 + 1, 4, 5, TRACK_H - 8, SLEEPER);
        rect(ctx, i * 8 + 1, 4, 5, 1, "#4a3822");
      }
      // Rotaia superiore e inferiore
      rect(ctx, 0, 3, 64, 2, RAIL);
      rect(ctx, 0, 3, 64, 1, RAIL_HI);
      rect(ctx, 0, TRACK_H - 6, 64, 2, RAIL);
      rect(ctx, 0, TRACK_H - 6, 64, 1, RAIL_HI);
    }),

    // --- Treno stile Regionale (per zona binari, depth DEPTH.trains) ---
    prop("prop:garibaldi_train", 140, 16, (ctx) => {
      rect(ctx, 0, 0, 140, 16, TR_BODY);
      rect(ctx, 0, 0, 140, 3, TR_TOP);           // fascia superiore
      rect(ctx, 0, 13, 140, 3, TR_UNDER);        // telaio inferiore
      // Finestrini: 2 carrozze × 3 finestre
      for (let car = 0; car < 2; car++) {
        const cx = car * 70 + 5;
        for (let w = 0; w < 3; w++) {
          rect(ctx, cx + w * 22, 4, 16, 7, TR_WIN);
          rect(ctx, cx + w * 22, 4, 16, 1, "#90b8d0");
        }
        // Porte tra le finestre
        rect(ctx, cx + 16, 3, 3, 9, TR_DOOR);
        rect(ctx, cx + 38, 3, 3, 9, TR_DOOR);
      }
      // Giunzione carrozze
      rect(ctx, 68, 2, 4, 12, TR_UNDER);
      rect(ctx, 69, 0, 2, 16, TR_TOP);
      // Striscia orizzontale caratteristica
      rect(ctx, 0, 11, 140, 1, "#3a6090");
      // Testata anteriore e posteriore
      rect(ctx, 0, 0, 4, 16, TR_TOP);
      rect(ctx, 136, 0, 4, 16, TR_TOP);
    }),
  ];
}

/**
 * Capsula panoramica degli ascensori (Stage 3).
 * Spritesheet 60×24: 3 frame da 20×24.
 * Frame 0: ferma/chiusa  Frame 1: aperta con luce  Frame 2: in corsa
 */
export function bakeCapsule(): { dataURL: string } {
  const { canvas, ctx } = makeCanvas(60, 24);
  const STEEL  = "#6a6a80";
  const BODY   = "#2a2a42";
  const BODY_M = "#32324e";   // corpo in movimento (leggermente piu' chiaro)
  const WIN_OFF = "#1a1a30";  // finestra spenta
  const WIN_ON  = "#ffff55";  // finestra illuminata
  const WIN_MOV = "#3a4a68";  // finestra in corsa

  for (let f = 0; f < 3; f++) {
    const ox = f * 20;
    const body = f === 2 ? BODY_M : BODY;

    // Gancio cavo in cima
    rect(ctx, ox + 8, 0, 4, 2, STEEL);

    // Corpo (bordo + interno)
    rect(ctx, ox + 1, 2, 18, 22, STEEL);
    rect(ctx, ox + 2, 3, 16, 20, body);

    // Finestra
    const wc = f === 0 ? WIN_OFF : f === 1 ? WIN_ON : WIN_MOV;
    rect(ctx, ox + 4, 5, 12, 7, wc);
    if (f === 1) {
      // riflesso superiore
      rect(ctx, ox + 4, 5, 12, 1, "#ffffaa");
    }

    // Righe di velocita' (solo frame 2)
    if (f === 2) {
      rect(ctx, ox + 4, 14, 7, 1, "#44446a");
      rect(ctx, ox + 4, 16, 10, 1, "#44446a");
      rect(ctx, ox + 4, 18, 5, 1, "#44446a");
    }

    // Porta aperta (solo frame 1): luce sul pavimento
    if (f === 1) {
      rect(ctx, ox + 2, 18, 7, 5, "#2a2a42");
      rect(ctx, ox + 11, 18, 7, 5, "#2a2a42");
      rect(ctx, ox + 8, 18, 4, 5, "#44440a");
    }

    // Highlight laterale sinistro
    rect(ctx, ox + 2, 3, 1, 20, "#3a3a5a");
  }

  return { dataURL: toDataURL(canvas) };
}
