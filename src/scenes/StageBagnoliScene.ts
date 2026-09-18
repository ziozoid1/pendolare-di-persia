import { STAGE_BAGNOLI } from "../levels/stageBagnoli";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class StageBagnoliScene extends StageScene {
  readonly def: StageDef = STAGE_BAGNOLI;
  constructor() {
    super("StageBagnoli");
  }
}
