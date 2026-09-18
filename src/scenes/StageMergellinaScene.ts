import { STAGE_MERGELLINA } from "../levels/stageMergellina";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class StageMergellinaScene extends StageScene {
  readonly def: StageDef = STAGE_MERGELLINA;
  constructor() {
    super("StageMergellina");
  }
}
