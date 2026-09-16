import type { ActorId, ClipName } from "../core/types";

/**
 * Uno "skin" e' una cartella in public/skins/<nome>/ con un skin.json.
 * Puo' sovrascrivere: i fogli degli attori, i singoli oggetti di scena e i
 * fondali. Tutto cio' che non dichiara resta procedurale, quindi puoi
 * sostituire solo il protagonista e lasciare il resto com'e'.
 */

export interface ActorSkin {
  /** File immagine relativo alla cartella dello skin. */
  image: string;
  /** Se omessi si usa la griglia canonica 32x44. */
  frameWidth?: number;
  frameHeight?: number;
  /** Origine dello sprite. Il default [0.5, 1] mette l'ancora sotto i piedi. */
  origin?: [number, number];
  /**
   * Indici dei frame per clip. Se omesso si assume il layout canonico
   * (vedi art/clips.ts): idle,walk,run,jump,fall,crouch,trip,push,offer,reach.
   */
  clips?: Partial<Record<ClipName, number[]>>;
  /** Fattore di scala se disegni a risoluzione piu' alta della griglia. */
  scale?: number;
}

export interface BackdropLayerSkin {
  image: string;
  /** 0 = immobile, 1 = ancorato al mondo. Valori bassi = piu' lontano. */
  scrollFactor?: number;
  y?: number;
  height?: number;
  /** Se true l'immagine viene ripetuta in orizzontale. */
  tile?: boolean;
  depth?: number;
  /** Velocita' autonoma del layer in px/s (usata per i treni). */
  speed?: number;
}

export interface BackdropSkin {
  layers: BackdropLayerSkin[];
}

export interface SkinManifest {
  name: string;
  actors?: Partial<Record<ActorId, ActorSkin>>;
  /** chiave prop (es. "prop:suitcase") -> file immagine. */
  props?: Record<string, string>;
  /** chiave fondale (es. "stazione") -> livelli di parallasse. */
  backdrops?: Record<string, BackdropSkin>;
}

/** Lo skin si scegle in URL: ?skin=foto-napoli. Comodo per confrontare stili. */
export function currentSkinName(): string | null {
  const q = new URLSearchParams(window.location.search).get("skin");
  return q && q.trim() !== "" ? q.trim() : null;
}

export function skinFileURL(skin: string, file: string): string {
  return `skins/${skin}/${file}`;
}
