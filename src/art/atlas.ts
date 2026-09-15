import Phaser from "phaser";
import { CLIPS, CLIP_ORDER, animKey, canonicalFrames } from "./clips";
import { bakeActorSheet, FRAME_H, FRAME_W } from "./bakeActors";
import { bakeBoard, bakeLobbyProps, bakeSolid, bakeStationProps } from "./bakeProps";
import { skinFileURL, type SkinManifest } from "./skin";
import { ACTOR_IDS, type ActorId, type ClipName } from "../core/types";
import { EGA } from "./palettes";

/** Cio' che serve al gioco per animare un attore, qualunque sia la sua origine. */
export interface ActorSource {
  textureKey: string;
  frames: Record<ClipName, number[]>;
  origin: [number, number];
  scale: number;
  frameWidth: number;
  frameHeight: number;
}

const sources = new Map<ActorId, ActorSource>();

export function actorSource(id: ActorId): ActorSource {
  const s = sources.get(id);
  if (!s) throw new Error(`Attore "${id}" non caricato: manca la fase di boot?`);
  return s;
}

/** Colori pieni disponibili come texture 1x1, per barre e pannelli della UI. */
export const SOLID = {
  black: "solid:black", white: "solid:white", lgray: "solid:lgray",
  dgray: "solid:dgray", lred: "solid:lred", lgreen: "solid:lgreen",
  yellow: "solid:yellow", panel: "solid:panel", dim: "solid:dim"
} as const;

/**
 * Mette in coda tutto cio' che serve: fogli degli attori (cotti dal rig o
 * presi dallo skin), oggetti di scena e tinte piatte.
 * Da chiamare dentro create() del BootScene, dopo aver letto skin.json.
 */
export function queueAssets(scene: Phaser.Scene, skin: SkinManifest | null): void {
  // ---- attori ------------------------------------------------------------
  for (const id of ACTOR_IDS) {
    const override = skin?.actors?.[id];
    const key = `actor:${id}`;
    const frameWidth = override?.frameWidth ?? FRAME_W;
    const frameHeight = override?.frameHeight ?? FRAME_H;

    const url = override
      ? skinFileURL(skin!.name, override.image)
      : bakeActorSheet(id); // data URL: per il loader e' un'immagine come le altre

    scene.load.spritesheet(key, url, { frameWidth, frameHeight });

    const frames = {} as Record<ClipName, number[]>;
    for (const clip of CLIP_ORDER) {
      frames[clip] = override?.clips?.[clip] ?? canonicalFrames(clip);
    }

    sources.set(id, {
      textureKey: key,
      frames,
      origin: override?.origin ?? [0.5, 1],
      scale: override?.scale ?? 1,
      frameWidth,
      frameHeight
    });
  }

  // ---- oggetti di scena --------------------------------------------------
  const baked = [
    ...bakeStationProps(),
    ...bakeLobbyProps(),
    bakeBoard(true),
    bakeBoard(false)
  ];
  for (const p of baked) {
    const override = skin?.props?.[p.key];
    scene.load.image(p.key, override ? skinFileURL(skin!.name, override) : p.dataURL);
  }

  // ---- tinte piatte (niente sistema di tint: cambiato in Phaser 4) ------
  const solids: Array<[string, string]> = [
    [SOLID.black, EGA.black], [SOLID.white, EGA.white], [SOLID.lgray, EGA.lgray],
    [SOLID.dgray, EGA.dgray], [SOLID.lred, EGA.lred], [SOLID.lgreen, EGA.lgreen],
    [SOLID.yellow, EGA.yellow], [SOLID.panel, "#0a0a18"], [SOLID.dim, "#331111"]
  ];
  for (const [key, col] of solids) {
    scene.load.image(key, bakeSolid(key, col).dataURL);
  }

  // ---- fondali dichiarati dallo skin ------------------------------------
  if (skin?.backdrops) {
    for (const bd of Object.values(skin.backdrops)) {
      for (const layer of bd.layers) {
        scene.load.image(layer.image, skinFileURL(skin.name, layer.image));
      }
    }
  }
}

/** Registra un'animazione Phaser per ogni clip di ogni attore. */
export function registerActorAnims(scene: Phaser.Scene): void {
  for (const id of ACTOR_IDS) {
    const src = actorSource(id);
    for (const clip of CLIP_ORDER) {
      const key = animKey(id, clip);
      if (scene.anims.exists(key)) continue;
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(src.textureKey, { frames: src.frames[clip] }),
        frameRate: CLIPS[clip].fps,
        repeat: CLIPS[clip].repeat
      });
    }
  }
}
