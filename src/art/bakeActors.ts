import { makeCanvas, rect, toDataURL, type Ctx } from "./pixel";
import { drawHuman, ANIM } from "./rig";
import { PALETTES } from "./palettes";
import { CLIPS, CLIP_ORDER, TOTAL_FRAMES } from "./clips";
import type { ActorId, ClipName } from "../core/types";

/** Dimensione di una cella dello spritesheet. Anche gli sheet esterni la usano. */
export const FRAME_W = 32;
export const FRAME_H = 44;
const FEET_X = 16;
const FEET_Y = 42;

/**
 * Dettagli che appartengono al personaggio (non alla scena) e che quindi vanno
 * cotti dentro i suoi frame. `hand` e' la posizione della mano vicina.
 */
type Decorator = (ctx: Ctx, clip: ClipName, hand: [number, number]) => void;

const ACTOR_DECOR: Partial<Record<ActorId, Decorator>> = {
  thief: (ctx) => {
    rect(ctx, FEET_X - 4, FEET_Y - 37, 9, 4, "#000000"); // cappuccio
  },
  tourist: (ctx) => {
    rect(ctx, FEET_X - 2, FEET_Y - 22, 5, 3, "#000000"); // macchina fotografica
    rect(ctx, FEET_X - 1, FEET_Y - 21, 3, 1, "#55ffff");
  },
  seller: (ctx, clip, hand) => {
    if (clip !== "offer") return;
    for (let i = 0; i < 3; i++) {
      rect(ctx, hand[0] - 2, hand[1] - 2 + i * 4, 6, 3, i % 2 ? "#55ffff" : "#ff55ff");
    }
  },
  guard: (ctx) => {
    rect(ctx, FEET_X - 5, FEET_Y - 38, 11, 2, "#0000aa"); // visiera
  },
  manager: (ctx) => {
    rect(ctx, FEET_X - 1, FEET_Y - 20, 2, 4, "#ffff55"); // badge al collo
  }
};

/**
 * Cuoce le 17 pose di un attore in un foglio orizzontale e lo restituisce come
 * data URL. Dal punto di vista del loader e' identico a un PNG su disco: e'
 * questo che rende lo stile sostituibile senza toccare il resto del codice.
 */
export function bakeActorSheet(actor: ActorId): string {
  const { canvas, ctx } = makeCanvas(FRAME_W * TOTAL_FRAMES, FRAME_H);
  const pal = PALETTES[actor];
  const decor = ACTOR_DECOR[actor];
  let index = 0;

  for (const clip of CLIP_ORDER) {
    const poses = ANIM[clip];
    for (let f = 0; f < CLIPS[clip].frames; f++) {
      const p = poses[Math.min(f, poses.length - 1)]!;
      ctx.save();
      ctx.translate(index * FRAME_W, 0);
      const hand = drawHuman(ctx, FEET_X, FEET_Y, p, pal, 1);
      decor?.(ctx, clip, hand);
      ctx.restore();
      index++;
    }
  }
  return toDataURL(canvas);
}
