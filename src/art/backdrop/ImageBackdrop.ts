import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W } from "../../core/constants";
import type { BackdropSkin } from "../skin";
import type { Backdrop } from "./Backdrop";

/**
 * Fondale costruito dalle immagini dichiarate in skin.json.
 * Un livello con tile:true diventa una TileSprite che scorre in parallasse;
 * gli altri sono immagini ancorate al mondo.
 * Se un layer dichiara speed (px/s), si sposta anche autonomamente —
 * utile per i treni che attraversano la scena indipendentemente dalla camera.
 */
export class ImageBackdrop implements Backdrop {
  private tiles: Array<{
    sprite: Phaser.GameObjects.TileSprite;
    factor: number;
    speed: number;
  }> = [];

  constructor(private readonly skin: BackdropSkin) {}

  build(scene: Phaser.Scene, levelWidth: number): void {
    this.skin.layers.forEach((layer, i) => {
      const y = layer.y ?? 0;
      const depth = layer.depth ?? DEPTH.sky + i;
      const factor = layer.scrollFactor ?? 1;

      if (layer.tile !== false) {
        const h = layer.height ?? GAME_H - y;
        const sprite = scene.add
          .tileSprite(0, y, GAME_W, h, layer.image)
          .setOrigin(0, 0)
          .setScrollFactor(0)
          .setDepth(depth);
        this.tiles.push({ sprite, factor, speed: layer.speed ?? 0 });
      } else {
        scene.add.image(0, y, layer.image)
          .setOrigin(0, 0)
          .setScrollFactor(factor)
          .setDepth(depth);
      }
    });
    void levelWidth;
  }

  update(scrollX: number, timeMs: number): void {
    const t = timeMs / 1000;
    for (const layer of this.tiles) {
      layer.sprite.tilePositionX = scrollX * layer.factor + t * layer.speed;
    }
  }
}
