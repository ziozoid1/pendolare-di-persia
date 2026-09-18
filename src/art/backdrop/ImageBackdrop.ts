import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W } from "../../core/constants";
import type { BackdropSkin } from "../skin";
import type { Backdrop } from "./Backdrop";
import { GattoTopoController } from "./GattoTopoController";

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
  private controller: GattoTopoController | null = null;
  private lastTimeMs = 0;

  constructor(
    private readonly skin: BackdropSkin,
    private readonly skinName: string
  ) {}

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

    // Attori di fondale (sprite animati senza corpo fisico)
    const actorSprites = new Map<string, Phaser.GameObjects.Sprite>();
    for (const actor of this.skin.actors ?? []) {
      const texKey = `bgactor:${this.skinName}:${actor.id}`;
      const depth = actor.depth ?? DEPTH.props;
      const sprite = scene.add
        .sprite(actor.x, actor.y, texKey, 0)
        .setOrigin(0.5, 1)
        .setDepth(depth);
      // avvia la prima clip come default; il controller la sovrascrive subito
      const firstClip = Object.keys(actor.clips)[0];
      if (firstClip) sprite.play(`bgactor:${this.skinName}:${actor.id}:${firstClip}`);
      actorSprites.set(actor.id, sprite);
    }

    // Macchina a stati specifica per la scena gatto/topo
    const gatto = actorSprites.get("gatto");
    const topo  = actorSprites.get("topo");
    if (gatto && topo) {
      const gattoActor = this.skin.actors?.find(a => a.id === "gatto");
      const topoActor  = this.skin.actors?.find(a => a.id === "topo");
      this.controller = new GattoTopoController(
        gatto, topo, this.skinName,
        gattoActor?.x ?? 98,
        topoActor?.x  ?? 300,
        -20
      );
    }
  }

  update(scrollX: number, timeMs: number): void {
    const dt = this.lastTimeMs === 0 ? 0 : Math.min((timeMs - this.lastTimeMs) / 1000, 0.05);
    this.lastTimeMs = timeMs;

    const t = timeMs / 1000;
    for (const layer of this.tiles) {
      layer.sprite.tilePositionX = scrollX * layer.factor + t * layer.speed;
    }

    this.controller?.update(dt);
  }
}
