import { STAGE3 } from "../levels/stage3";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class Stage3Scene extends StageScene {
  readonly def: StageDef = STAGE3;
  constructor() {
    super("Stage3");
  }
}
