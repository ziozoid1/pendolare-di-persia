import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { Entity } from "./Entity";

const BOX_W = 13;
const BOX_H = 11;

/**
 * Valigia (o transenna, o cassone dei lavori: cambia solo la texture).
 * Ostacolo da scavalcare. Con `drift` va avanti e indietro, come quelle
 * trascinate dai turisti.
 */
export class Suitcase extends Entity {
  private img!: Phaser.GameObjects.Image;
  private dir = 1;
  private from = 0;
  private to = 0;
  private speed = 0;

  override create(): void {
    this.y = this.def.y ?? GROUND_Y;
    const texture = typeof this.def.texture === "string" ? this.def.texture : "prop:suitcase";
    this.img = this.host.add
      .image(this.x, this.y, texture)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.entities);

    const drift = this.def.drift as { from: number; to: number; speed: number } | undefined;
    if (drift) {
      this.from = drift.from;
      this.to = drift.to;
      this.speed = drift.speed;
    }
  }

  override update(dt: number): void {
    if (this.speed !== 0) {
      this.x += this.dir * this.speed * dt;
      if (this.x > this.to || this.x < this.from) this.dir *= -1;
      this.img.x = Math.round(this.x);
    }

    const player = this.host.player;
    if (player.isTripping) return;

    const overlapX = Math.abs(player.x - this.x) < BOX_W / 2 + 4;
    const feetBelowTop = player.y > this.y - BOX_H + 2;
    if (overlapX && feetBelowTop) {
      player.trip();
      this.host.hurt("Inciampato in una valigia.");
    }
  }

  override destroy(): void {
    this.img.destroy();
  }
}
