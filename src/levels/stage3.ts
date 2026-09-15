import { GAME_W } from "../core/constants";
import type { StageDef } from "../core/types";

/**
 * STAGE 3 - Gli ascensori.
 * Una schermata sola: e' una stanza, non una corsa. Tutta la logica sta
 * nell'entita' `elevator-hall`, che tiene la fila, le cabine e chi scavalca.
 */
export const STAGE3: StageDef = {
  key: "Stage3",
  title: "GLI ASCENSORI",
  subtitle: "Atrio Torre Saverio, ore 9:02",
  width: GAME_W,
  startX: 20,
  clockStart: 9 * 60 + 2,
  clockDeadline: 9 * 60 + 25,
  patience: 3,
  backdrop: "atrio",
  next: "Stage4",
  floor: [{ x: 0, w: GAME_W }],
  entities: [
    {
      kind: "elevator-hall",
      x: 0,
      frontX: 222,
      doorA: 250,
      doorB: 292,
      initialQueue: 4,
      cabinCycle: 8.5
    }
  ]
};
