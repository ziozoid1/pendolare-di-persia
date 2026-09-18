import { GROUND_Y } from "../core/constants";
import type { StageDef } from "../core/types";

export const STAGE_STORICO: StageDef = {
  key: "StageStorico",
  title: "CENTRO STORICO",
  subtitle: "Spaccanapoli, ore 8:10",
  width: 404,
  startX: 20,
  clockStart: 8 * 60 + 10,
  clockDeadline: 8 * 60 + 30,
  patience: 3,
  backdrop: "centro-storico",
  skin: "centro-storico",
  luogo: 2,
  next: "Map",
  floor: [{ x: 0, w: 404 }],
  entities: [
    { kind: "exit", x: 364, y: GROUND_Y, label: "USCITA", sublabel: "P. GARIBALDI" }
  ]
};
