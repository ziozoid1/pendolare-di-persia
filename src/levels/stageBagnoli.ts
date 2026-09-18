import { GROUND_Y } from "../core/constants";
import type { StageDef } from "../core/types";

export const STAGE_BAGNOLI: StageDef = {
  key: "StageBagnoli",
  title: "ITALSIDER BAGNOLI",
  subtitle: "Stabilimento, ore 7:30",
  width: 355,
  startX: 20,
  clockStart: 7 * 60 + 30,
  clockDeadline: 7 * 60 + 50,
  patience: 3,
  backdrop: "italsider",
  skin: "italsider",
  luogo: 0,
  next: "Map",
  floor: [{ x: 0, w: 355 }],
  entities: [
    { kind: "exit", x: 315, y: GROUND_Y, label: "USCITA", sublabel: "MERGELLINA" }
  ]
};
