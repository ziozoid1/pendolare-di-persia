import { GAME_W, GROUND_Y } from "../core/constants";
import type { StageDef } from "../core/types";

const SCREENS = 7;
const WIDTH = GAME_W * SCREENS;

/**
 * STAGE 1 - Piazza Garibaldi / Stazione Centrale.
 * Sette schermate: si parte dal binario e si esce verso il Centro Direzionale.
 * Le coordinate sono in pixel di mondo; una schermata sono 320 px.
 */
export const STAGE1: StageDef = {
  key: "Stage1",
  title: "PIAZZA GARIBALDI",
  subtitle: "Stazione Centrale, ore 8:32",
  width: WIDTH,
  startX: 30,
  clockStart: 8 * 60 + 32,
  clockDeadline: 9 * 60,
  patience: 3,
  backdrop: "stazione",
  next: "Stage2",
  floor: [{ x: 0, w: WIDTH }],
  entities: [
    // schermata 1: si impara a saltare
    { kind: "case", x: 250 },

    // schermata 2: primo venditore
    { kind: "seller", x: 430, facing: -1 },
    { kind: "tourist", x: 570, facing: 1 },
    { kind: "case", x: 592 },

    // schermata 3: gruppo di turisti e una valigia trascinata
    { kind: "tourist", x: 700, facing: -1, phase: 1.4 },
    { kind: "tourist", x: 716, facing: 1, phase: 2.2 },
    { kind: "case", x: 760, drift: { from: 745, to: 830, speed: 21 } },
    { kind: "case", x: 900 },

    // schermata 4: primo ladro
    { kind: "thief", x: 1080, range: 46 },
    { kind: "case", x: 1180 },

    // schermata 5: venditore piu' insistente
    { kind: "seller", x: 1340, facing: -1, hard: true },
    { kind: "tourist", x: 1460, facing: -1, phase: 0.6 },
    { kind: "case", x: 1476 },

    // schermata 6: ladro con valigie a fare da trappola
    { kind: "case", x: 1620 },
    { kind: "case", x: 1672 },
    { kind: "thief", x: 1780, range: 52 },

    // schermata 7: uscita
    { kind: "tourist", x: 1980, facing: 1, phase: 1.1 },
    { kind: "case", x: 1996 },
    { kind: "exit", x: WIDTH - 40, y: GROUND_Y, label: "USCITA", sublabel: "C.DIR." }
  ]
};
