import Phaser from "phaser";
import { CLIPS, CLIP_ORDER, animKey, canonicalFrames } from "./clips";
import { bakeActorSheet, FRAME_H, FRAME_W } from "./bakeActors";
import { bakeBoard, bakeCapsule, bakeGaribaldiProps, bakeLobbyProps, bakeSlabProps, bakeSolid, bakeStationProps } from "./bakeProps";
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
  /** Prefisso usato nelle chiavi animazione Phaser. Es. "hero" o "torre-ascensori:hero". */
  animPrefix: string;
}

const sources = new Map<ActorId, ActorSource>();
/** Sorgenti degli attori delle skin per-stage: chiave "<skinName>:<actorId>". */
const skinSources = new Map<string, ActorSource>();

/**
 * Restituisce la sorgente di un attore.
 * Se skinName e' fornito e quello skin dichiara quell'attore usa il suo foglio,
 * altrimenti ricade sulla skin globale.
 */
export function actorSource(id: ActorId, skinName?: string): ActorSource {
  if (skinName) {
    const s = skinSources.get(`${skinName}:${id}`);
    if (s) return s;
  }
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
 * Chiave texture capsula ascensore. Le skin per-stage usano una chiave
 * namespaced per non collidere con quella globale gia' caricata in queueAssets.
 */
export function capsuleTextureKey(skinName?: string): string {
  return skinName ? `prop:${skinName}:capsula` : "prop:capsula";
}

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
      frameHeight,
      animPrefix: id
    });
  }

  // ---- oggetti di scena --------------------------------------------------
  const baked = [
    ...bakeStationProps(),
    ...bakeLobbyProps(),
    ...bakeSlabProps(),
    ...bakeGaribaldiProps(),
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

  // ---- schermate speciali -----------------------------------------------
  if (skin?.screens?.title) {
    scene.load.image("screen:title", skinFileURL(skin.name, skin.screens.title));
  }

  // ---- capsula ascensore (Stage 3, spritesheet 3×24×30) -----------------
  // Lo skin puo' sovrascrivere con prop:capsula nel manifest; altrimenti si usa
  // bakeCapsule() come fallback. In entrambi i casi frameWidth=24, frameHeight=30.
  const capsuleSkinFile = skin?.props?.["prop:capsula"];
  const capsuleSrc = capsuleSkinFile
    ? skinFileURL(skin!.name, capsuleSkinFile)
    : bakeCapsule().dataURL;
  scene.load.spritesheet("prop:capsula", capsuleSrc, { frameWidth: 24, frameHeight: 30 });
}

/**
 * Carica i fogli degli attori dichiarati da un manifest per-stage, con chiavi
 * "actor:<skinName>:<actorId>" per non sovrascrivere quelli globali.
 */
export function queueSkinActors(scene: Phaser.Scene, skin: SkinManifest): void {
  if (!skin.actors) return;
  for (const id of ACTOR_IDS) {
    const override = skin.actors[id];
    if (!override) continue;
    const key = `actor:${skin.name}:${id}`;
    const frameWidth = override.frameWidth ?? FRAME_W;
    const frameHeight = override.frameHeight ?? FRAME_H;
    scene.load.spritesheet(key, skinFileURL(skin.name, override.image), { frameWidth, frameHeight });
    const frames = {} as Record<ClipName, number[]>;
    for (const clip of CLIP_ORDER) {
      frames[clip] = override.clips?.[clip] ?? canonicalFrames(clip);
    }
    skinSources.set(`${skin.name}:${id}`, {
      textureKey: key,
      frames,
      origin: override.origin ?? [0.5, 1],
      scale: override.scale ?? 1,
      frameWidth,
      frameHeight,
      animPrefix: `${skin.name}:${id}`
    });
  }
}

/** Registra le animazioni degli attori di una skin per-stage. */
export function registerSkinActorAnims(scene: Phaser.Scene, skinName: string): void {
  for (const id of ACTOR_IDS) {
    const mapKey = `${skinName}:${id}`;
    const src = skinSources.get(mapKey);
    if (!src) continue;

    // Se la texture non e' stata caricata (es. 404), rimuovi il source cosi'
    // actorSource ricade sul global invece di usare una texture mancante.
    if (!scene.textures.exists(src.textureKey)) {
      skinSources.delete(mapKey);
      continue;
    }

    for (const clip of CLIP_ORDER) {
      const key = animKey(src.animPrefix, clip);
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

/**
 * Carica fondali e props spritesheet dichiarati da un manifest per-stage.
 * Gli attori vengono gestiti separatamente da queueSkinActors.
 */
export function queueSkinBackdrops(scene: Phaser.Scene, skin: SkinManifest): void {
  if (skin.backdrops) {
    for (const bd of Object.values(skin.backdrops)) {
      for (const layer of bd.layers) {
        scene.load.image(layer.image, skinFileURL(skin.name, layer.image));
      }
    }
  }

  // prop:capsula caricato con chiave namespaced per non collidere con quella
  // globale (gia' caricata in queueAssets con bakeCapsule()).
  const capsuleProp = skin.props?.["prop:capsula"];
  if (capsuleProp) {
    scene.load.spritesheet(capsuleTextureKey(skin.name), skinFileURL(skin.name, capsuleProp), {
      frameWidth: 24, frameHeight: 30
    });
  }
}

/** Registra un'animazione Phaser per ogni clip di ogni attore globale. */
export function registerActorAnims(scene: Phaser.Scene): void {
  for (const id of ACTOR_IDS) {
    const src = actorSource(id);
    for (const clip of CLIP_ORDER) {
      const key = animKey(src.animPrefix, clip);
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
