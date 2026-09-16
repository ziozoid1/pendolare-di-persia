import Phaser from "phaser";
import type { SkinManifest } from "../skin";
import { GaribaldiBackdrop } from "./GaribaldiBackdrop";
import { ImageBackdrop } from "./ImageBackdrop";
import { LobbyBackdrop } from "./LobbyBackdrop";
import { SlabBackdrop } from "./SlabBackdrop";
import { StationBackdrop } from "./StationBackdrop";

/**
 * Un fondale sa costruirsi dentro una scena e aggiornare la propria
 * parallasse. Due implementazioni: dipinta a codice, oppure da immagini.
 */
export interface Backdrop {
  build(scene: Phaser.Scene, levelWidth: number): void;
  update(scrollX: number, timeMs: number): void;
}

/**
 * Se lo skin dichiara un fondale con questo nome vincono le immagini,
 * altrimenti si usa quello procedurale. Per aggiungere un fondale nuovo
 * (il Centro Direzionale, gli ascensori, il 32esimo piano) si registra qui.
 */
export function createBackdrop(name: string, skin: SkinManifest | null): Backdrop {
  const fromSkin = skin?.backdrops?.[name];
  if (fromSkin) return new ImageBackdrop(fromSkin);

  switch (name) {
    case "garibaldi":
      return new GaribaldiBackdrop();
    case "stazione":
      return new StationBackdrop();
    case "stazione-slab":
      return new SlabBackdrop();
    case "atrio":
      return new LobbyBackdrop();
    default:
      // I fondali degli stage successivi ricadono qui finche' non esistono.
      return new StationBackdrop();
  }
}
