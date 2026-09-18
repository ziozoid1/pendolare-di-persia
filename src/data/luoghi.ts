export interface Luogo {
  nome: string;
  x: number;
  y: number;
  sbloccato: boolean;
  /** Chiave della scena Phaser da avviare; undefined = non ancora implementata. */
  scena?: string;
}

/** Cinque luoghi sulla mappa, in ordine geografico ovest→est. */
export const LUOGHI: Luogo[] = [
  { nome: "ITALSIDER BAGNOLI",  x:  40, y:  76, sbloccato: true },
  { nome: "MERGELLINA",         x:  92, y: 100, sbloccato: true },
  { nome: "CENTRO STORICO",     x: 163, y:  90, sbloccato: true },
  { nome: "P. GARIBALDI",       x: 232, y:  74, sbloccato: true, scena: "Stage1" },
  { nome: "CENTRO DIREZIONALE", x: 292, y:  50, sbloccato: true, scena: "Stage2" },
];

/** Unica regola di sblocco: domani cambiare qui basta. */
export function luogoDisponibile(indice: number): boolean {
  return (LUOGHI[indice]?.sbloccato) ?? false;
}
