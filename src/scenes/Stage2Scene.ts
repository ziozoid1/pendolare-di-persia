import { STAGE2 } from "../levels/stage2";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class Stage2Scene extends StageScene {
  readonly def: StageDef = STAGE2;
  constructor() {
    super("Stage2");
  }
}
