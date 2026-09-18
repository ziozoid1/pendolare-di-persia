export interface Luogo {
  nome: string;
  x: number;
  y: number;
}

/** Cinque luoghi sulla mappa, in ordine geografico ovest→est. */
export const LUOGHI: Luogo[] = [
  { nome: "ITALSIDER BAGNOLI",  x:  40, y:  76 },
  { nome: "MERGELLINA",         x:  92, y: 100 },
  { nome: "CENTRO STORICO",     x: 163, y:  90 },
  { nome: "P. GARIBALDI",       x: 232, y:  74 },
  { nome: "CENTRO DIREZIONALE", x: 292, y:  50 },
];
