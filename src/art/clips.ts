import type { ClipName } from "../core/types";

export interface ClipSpec {
  frames: number;
  fps: number;
  /** -1 = in loop, 0 = una volta sola. */
  repeat: number;
}

/**
 * CONTRATTO DI ANIMAZIONE.
 * Vale sia per lo spritesheet generato dal rig sia per le immagini caricate da
 * file: se il foglio segue questo ordine di frame non serve configurare nulla.
 * Ordine canonico: idle(2) walk(4) run(4) jump(1) fall(1) crouch(1) trip(1)
 * push(1) offer(1) reach(1) = 17 frame in fila su una sola riga.
 */
export const CLIPS: Record<ClipName, ClipSpec> = {
  idle:   { frames: 2, fps: 4,  repeat: -1 },
  walk:   { frames: 4, fps: 9,  repeat: -1 },
  run:    { frames: 4, fps: 14, repeat: -1 },
  jump:   { frames: 1, fps: 1,  repeat: 0 },
  fall:   { frames: 1, fps: 1,  repeat: 0 },
  crouch: { frames: 1, fps: 1,  repeat: 0 },
  trip:   { frames: 1, fps: 1,  repeat: 0 },
  push:   { frames: 1, fps: 6,  repeat: -1 },
  offer:  { frames: 1, fps: 2,  repeat: -1 },
  reach:  { frames: 1, fps: 2,  repeat: -1 }
};

export const CLIP_ORDER: ClipName[] = [
  "idle", "walk", "run", "jump", "fall", "crouch", "trip", "push", "offer", "reach"
];

export const TOTAL_FRAMES: number =
  CLIP_ORDER.reduce((n, c) => n + CLIPS[c].frames, 0);

/** Indici dei frame di una clip nel layout canonico. */
export function canonicalFrames(clip: ClipName): number[] {
  let start = 0;
  for (const c of CLIP_ORDER) {
    if (c === clip) break;
    start += CLIPS[c].frames;
  }
  return Array.from({ length: CLIPS[clip].frames }, (_, i) => start + i);
}

/** Chiave dell'animazione Phaser per un attore. */
export function animKey(actor: string, clip: ClipName): string {
  return `${actor}:${clip}`;
}
