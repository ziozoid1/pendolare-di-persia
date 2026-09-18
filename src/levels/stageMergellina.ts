import { GROUND_Y } from "../core/constants";
import type { StageDef } from "../core/types";

export const STAGE_MERGELLINA: StageDef = {
  key: "StageMergellina",
  title: "MERGELLINA",
  subtitle: "Lungomare, ore 7:45",
  width: 542,
  startX: 20,
  clockStart: 7 * 60 + 45,
  clockDeadline: 8 * 60 + 5,
  patience: 3,
  backdrop: "mergellina",
  skin: "mergellina",
  luogo: 1,
  next: "Map",
  floor: [{ x: 0, w: 542 }],
  entities: [
    { kind: "exit", x: 502, y: GROUND_Y, label: "USCITA", sublabel: "C. STORICO" }
  ]
};
