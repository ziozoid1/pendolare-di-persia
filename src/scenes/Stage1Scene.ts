import { STAGE1 } from "../levels/stage1";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class Stage1Scene extends StageScene {
  readonly def: StageDef = STAGE1;
  constructor() {
    super("Stage1");
  }
}
