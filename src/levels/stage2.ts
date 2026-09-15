import { GAME_W, GROUND_Y } from "../core/constants";
import type { StageDef } from "../core/types";

const SCREENS = 6;
const WIDTH = GAME_W * SCREENS;

/**
 * STAGE 2 - Il Centro Direzionale.
 * Le buche non sono entita': sono i varchi tra i segmenti di `floor`. Con un
 * salto da fermo si coprono circa 45 px, quindi i varchi stanno sui 36-40 px:
 * passabili di corsa, puniti se ci si arriva camminando.
 *
 * Da aggiungere qui: scale mobili ferme (piano inclinato lento), pozzanghere
 * che rallentano, cantieri con transenne mobili, il vento tra le torri.
 */
export const STAGE2: StageDef = {
  key: "Stage2",
  title: "CENTRO DIREZIONALE",
  subtitle: "Isola F, ore 8:47",
  width: WIDTH,
  startX: 24,
  clockStart: 8 * 60 + 47,
  clockDeadline: 9 * 60 + 10,
  patience: 3,
  backdrop: "centro-direzionale",
  next: "Stage3",
  floor: [
    { x: 0, w: 400 },
    { x: 436, w: 384 },
    { x: 856, w: 324 },
    { x: 1220, w: 300 },
    { x: 1556, w: 364 }
  ],
  entities: [
    { kind: "barrier", x: 300 },
    { kind: "tourist", x: 520, facing: -1 },
    { kind: "barrier", x: 640 },
    { kind: "barrier", x: 690 },
    { kind: "thief", x: 980, range: 50 },
    { kind: "barrier", x: 1300 },
    { kind: "tourist", x: 1420, facing: 1 },
    { kind: "barrier", x: 1700 },
    { kind: "exit", x: WIDTH - 40, y: GROUND_Y, label: "TORRE", sublabel: "SAVERIO" }
  ]
};
