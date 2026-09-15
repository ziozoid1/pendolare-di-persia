import { line, rect, px, type Ctx } from "./pixel";
import { shade, type Palette } from "./palettes";
import type { ClipName } from "../core/types";

/**
 * RIG UMANO PROCEDURALE
 * Uno scheletro con angoli keyframe, condiviso da tutti i personaggi.
 * Angoli in gradi: 0 = verso il basso, positivo = in avanti (verso `facing`).
 *
 * Questo modulo NON disegna a schermo durante il gioco: viene usato una volta
 * sola a boot da bakeActors.ts per cuocere gli spritesheet. Se sostituisci lo
 * stile con delle immagini, questo file smette semplicemente di essere usato.
 */

const HIP_Y = -17;
const SHO_Y = -28;
const HEAD_Y = -33;
const THIGH = 9, SHIN = 9, UPPER = 8, FORE = 8;

export interface Pose {
  /** Coscia e ginocchio della gamba vicina. */
  t1: number; k1: number;
  /** Coscia e ginocchio della gamba lontana. */
  t2: number; k2: number;
  /** Spalla e gomito del braccio vicino. */
  a1: number; e1: number;
  /** Spalla e gomito del braccio lontano. */
  a2: number; e2: number;
  /** Sollevamento del bacino e inclinazione del busto. */
  bob: number; lean: number;
}

function pose(p: Partial<Pose>): Pose {
  return { t1: 0, k1: 0, t2: 0, k2: 0, a1: 0, e1: 0, a2: 0, e2: 0, bob: 0, lean: 0, ...p };
}

function fwd(x: number, y: number, ang: number, len: number, facing: number): [number, number] {
  const r = (ang * Math.PI) / 180;
  return [x + Math.sin(r) * len * facing, y + Math.cos(r) * len];
}

export const ANIM: Record<ClipName, Pose[]> = {
  idle: [
    pose({ t1: 2, k1: -3, t2: -3, k2: -4, a1: 4, e1: -8, a2: -4, e2: -6, lean: 2 }),
    pose({ t1: 2, k1: -3, t2: -3, k2: -4, a1: 3, e1: -7, a2: -3, e2: -5, lean: 2, bob: -1 })
  ],
  walk: [
    pose({ t1: 26, k1: -6, t2: -22, k2: -30, a1: -22, e1: -14, a2: 24, e2: -18, lean: 4 }),
    pose({ t1: 6, k1: -4, t2: -4, k2: -52, a1: -8, e1: -12, a2: 8, e2: -14, lean: 4, bob: -2 }),
    pose({ t1: -22, k1: -30, t2: 26, k2: -6, a1: 24, e1: -18, a2: -22, e2: -14, lean: 4 }),
    pose({ t1: -4, k1: -52, t2: 6, k2: -4, a1: 8, e1: -14, a2: -8, e2: -12, lean: 4, bob: -2 })
  ],
  run: [
    pose({ t1: 42, k1: -14, t2: -34, k2: -62, a1: -40, e1: -52, a2: 44, e2: -58, lean: 14 }),
    pose({ t1: 14, k1: -8, t2: -8, k2: -96, a1: -14, e1: -40, a2: 16, e2: -44, lean: 14, bob: -3 }),
    pose({ t1: -34, k1: -62, t2: 42, k2: -14, a1: 44, e1: -58, a2: -40, e2: -52, lean: 14 }),
    pose({ t1: -8, k1: -96, t2: 14, k2: -8, a1: 16, e1: -44, a2: -14, e2: -40, lean: 14, bob: -3 })
  ],
  jump:   [pose({ t1: 34, k1: -46, t2: -16, k2: -70, a1: -52, e1: -20, a2: -34, e2: -24, lean: 10 })],
  fall:   [pose({ t1: 20, k1: -20, t2: -22, k2: -40, a1: -40, e1: -30, a2: -20, e2: -34, lean: 6 })],
  crouch: [pose({ t1: 40, k1: -84, t2: -34, k2: -92, a1: -62, e1: -96, a2: -58, e2: -92, lean: 24, bob: 9 })],
  trip:   [pose({ t1: 62, k1: -30, t2: -48, k2: -20, a1: -84, e1: -10, a2: -70, e2: -18, lean: 34, bob: 3 })],
  push:   [pose({ t1: 16, k1: -8, t2: -18, k2: -14, a1: -66, e1: -6, a2: -54, e2: -12, lean: 16 })],
  offer:  [pose({ t1: 6, k1: -4, t2: -8, k2: -6, a1: -88, e1: -4, a2: -30, e2: -40, lean: 6 })],
  reach:  [pose({ t1: 22, k1: -10, t2: -20, k2: -16, a1: -96, e1: -2, a2: -40, e2: -20, lean: 20 })]
};

function drawLeg(ctx: Ctx, hx: number, hy: number, t: number, k: number, pal: Palette, facing: number, far: boolean): void {
  const pants = far ? shade(pal.pants) : pal.pants;
  const shoes = far ? shade(pal.shoes) : pal.shoes;
  const knee = fwd(hx, hy, t, THIGH, facing);
  const foot = fwd(knee[0], knee[1], t + k, SHIN, facing);
  line(ctx, hx, hy, knee[0], knee[1], pants, 4);
  line(ctx, knee[0], knee[1], foot[0], foot[1], pants, 3);
  rect(ctx, foot[0] - 1 + (facing > 0 ? 0 : -2), foot[1] - 1, 4, 2, shoes);
}

function drawArm(ctx: Ctx, sx: number, sy: number, a: number, e: number, pal: Palette, facing: number, far: boolean): [number, number] {
  const col = far ? shade(pal.shirt) : pal.shirt;
  const elbow = fwd(sx, sy + 2, a, UPPER, facing);
  const hand = fwd(elbow[0], elbow[1], a + e, FORE, facing);
  line(ctx, sx, sy + 2, elbow[0], elbow[1], col, 3);
  line(ctx, elbow[0], elbow[1], hand[0], hand[1], col, 3);
  px(ctx, hand[0], hand[1], pal.skin);
  px(ctx, hand[0], hand[1] + 1, pal.skin);
  return hand;
}

/**
 * Disegna un personaggio con i piedi in (x, y).
 * Restituisce la posizione della mano vicina: serve per attaccarci oggetti
 * (i calzini del venditore, il badge, un caffe').
 */
export function drawHuman(
  ctx: Ctx, x: number, y: number, p: Pose, pal: Palette, facing: 1 | -1
): [number, number] {
  x = Math.round(x);
  y = Math.round(y);
  const hipY = y + HIP_Y + p.bob;
  const leanRad = (p.lean * Math.PI) / 180;
  const shoX = x + Math.round(Math.sin(leanRad) * (HIP_Y - SHO_Y)) * facing;
  const shoY = y + SHO_Y + p.bob + Math.round(p.lean * 0.05);

  // lato lontano prima, per dare profondita'
  drawLeg(ctx, x, hipY, p.t2, p.k2, pal, facing, true);
  drawArm(ctx, shoX, shoY, p.a2, p.e2, pal, facing, true);

  // zaino del portatile
  if (pal.bag) {
    const bx = shoX - facing * 6;
    const by = shoY + 1;
    rect(ctx, bx - 2, by, 5, 10, pal.bag);
    rect(ctx, bx - 2, by, 5, 1, "#000000");
    line(ctx, shoX - facing * 2, shoY, bx + 1, by + 1, "#555555", 1);
  }

  // busto rastremato
  const span = hipY - shoY;
  for (let i = 0; i <= span; i++) {
    const t = span === 0 ? 0 : i / span;
    const cx = shoX + (x - shoX) * t;
    const w = Math.round(7 - t * 1.5);
    rect(ctx, cx - w / 2, shoY + i, w, 1, pal.shirt);
  }
  rect(ctx, shoX - 4, shoY, 8, 2, pal.shirt);
  rect(ctx, shoX - 1, shoY + 1, 2, 5, "#555555"); // cravatta
  rect(ctx, x - 4, hipY - 1, 8, 3, pal.pants);

  // testa
  const hx = shoX + facing * 1;
  const hy = y + HEAD_Y + p.bob + Math.round(p.lean * 0.12);
  rect(ctx, hx - 3, hy - 3, 7, 7, pal.skin);
  rect(ctx, hx - 3, hy - 4, 7, 2, pal.hair);
  rect(ctx, hx - 4, hy - 3, 1, 3, pal.hair);
  px(ctx, hx + facing * 2, hy, "#000000");
  rect(ctx, hx - 1, hy + 4, 3, 2, pal.skin);

  // lato vicino sopra a tutto
  drawLeg(ctx, x, hipY, p.t1, p.k1, pal, facing, false);
  return drawArm(ctx, shoX, shoY, p.a1, p.e1, pal, facing, false);
}
