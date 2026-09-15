import type { ActorId } from "../core/types";

/** Palette EGA a 16 colori, come nel PoP originale. */
export const EGA = {
  black: "#000000", blue: "#0000aa", green: "#00aa00", cyan: "#00aaaa",
  red: "#aa0000", magenta: "#aa00aa", brown: "#aa5500", lgray: "#aaaaaa",
  dgray: "#555555", lblue: "#5555ff", lgreen: "#55ff55", lcyan: "#55ffff",
  lred: "#ff5555", lmagenta: "#ff55ff", yellow: "#ffff55", white: "#ffffff"
} as const;

export interface Palette {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  shoes: string;
  /** Zaino/borsa del portatile. null = nessuna borsa. */
  bag: string | null;
}

export const PALETTES: Record<ActorId, Palette> = {
  hero:      { skin: "#d8a060", hair: EGA.black,  shirt: EGA.white,  pants: EGA.blue,  shoes: EGA.black, bag: EGA.brown },
  seller:    { skin: "#b07a40", hair: EGA.brown,  shirt: EGA.lred,   pants: EGA.dgray, shoes: EGA.black, bag: EGA.yellow },
  thief:     { skin: "#c08c50", hair: EGA.black,  shirt: EGA.dgray,  pants: EGA.black, shoes: EGA.dgray, bag: null },
  tourist:   { skin: "#e8c090", hair: EGA.yellow, shirt: EGA.lcyan,  pants: EGA.lgray, shoes: EGA.white, bag: null },
  colleague: { skin: "#d8a060", hair: EGA.brown,  shirt: EGA.lcyan,  pants: EGA.dgray, shoes: EGA.black, bag: EGA.dgray },
  manager:   { skin: "#d8a060", hair: EGA.lgray,  shirt: EGA.lgray,  pants: EGA.black, shoes: EGA.black, bag: null },
  guard:     { skin: "#b07a40", hair: EGA.black,  shirt: EGA.blue,   pants: EGA.blue,  shoes: EGA.black, bag: null }
};

/** Ombra usata per gli arti sul lato lontano: da' profondita' senza secondo sprite. */
export function shade(hex: string): string {
  const map: Record<string, string> = {
    [EGA.white]: EGA.lgray, [EGA.lgray]: EGA.dgray, [EGA.blue]: "#000066",
    [EGA.dgray]: "#333333", [EGA.black]: EGA.black, [EGA.lred]: EGA.red,
    [EGA.lcyan]: EGA.cyan, [EGA.brown]: "#663300", [EGA.yellow]: EGA.brown
  };
  return map[hex] ?? EGA.dgray;
}
