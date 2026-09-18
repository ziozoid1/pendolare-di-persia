export { STAGE1 } from "./stage1";
export { STAGE2 } from "./stage2";
export { STAGE3 } from "./stage3";
export { STAGE_BAGNOLI } from "./stageBagnoli";
export { STAGE_MERGELLINA } from "./stageMergellina";
export { STAGE_STORICO } from "./stageStorico";

import { STAGE1 } from "./stage1";
import { STAGE2 } from "./stage2";
import { STAGE3 } from "./stage3";
import { STAGE_BAGNOLI } from "./stageBagnoli";
import { STAGE_MERGELLINA } from "./stageMergellina";
import { STAGE_STORICO } from "./stageStorico";
/** Lista di tutti gli stage: usata da BootScene per scoprire le skin da pre-caricare. */
export const ALL_STAGES = [STAGE1, STAGE2, STAGE3, STAGE_BAGNOLI, STAGE_MERGELLINA, STAGE_STORICO];
