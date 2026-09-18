import { STAGE_STORICO } from "../levels/stageStorico";
import type { StageDef } from "../core/types";
import { StageScene } from "./StageScene";

export class StageStoricoScene extends StageScene {
  readonly def: StageDef = STAGE_STORICO;
  constructor() {
    super("StageStorico");
  }
}
