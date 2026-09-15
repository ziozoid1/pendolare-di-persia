import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { animKey } from "../art/clips";
import { actorSource } from "../art/atlas";
import { Entity } from "./Entity";

/**
 * Turista fermo in mezzo alla strada. Non ti fa male: ti fa perdere tempo,
 * che in questo gioco e' la vera valuta.
 */
export class Tourist extends Entity {
  private sprite!: Phaser.GameObjects.Sprite;
  private phase = 0;
  private baseY = 0;

  override create(): void {
    this.baseY = this.def.y ?? GROUND_Y;
    this.phase = this.num("phase", Math.random() * 6);
    const src = actorSource("tourist");
    this.sprite = this.host.add
      .sprite(this.x, this.baseY, src.textureKey, 0)
      .setOrigin(src.origin[0], src.origin[1])
      .setScale(src.scale)
      .setDepth(DEPTH.entities)
      .setFlipX((this.def.facing ?? 1) === -1);
    this.sprite.play(animKey("tourist", "idle"));
  }

  override update(dt: number): void {
    this.phase += dt;
    this.sprite.y = Math.round(this.baseY + Math.sin(this.phase * 1.3) * 1.2);

    const player = this.host.player;
    if (player.isTripping || !player.onGround) return;

    const dx = player.x - this.x;
    if (Math.abs(dx) < 8) {
      const side = Math.sign(dx) || 1;
      player.sprite.x = this.x + side * 8;
      player.block();
    }
  }

  override destroy(): void {
    this.sprite.destroy();
  }
}
