import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { animKey } from "../art/clips";
import { actorSource } from "../art/atlas";
import { Entity } from "./Entity";

export const SELLER_LINES = [
  "\u00abDue paia, tre euro! Bell'o zi'!\u00bb",
  "\u00abGuagli\u00f2, tre paia, cinque euro!\u00bb",
  "\u00abPure i calzini della salute!\u00bb",
  "\u00abE famme fa' 'a giornata!\u00bb"
];

/**
 * Venditore di calzini. E' il duello di scherma del Prince of Persia
 * originale, rifatto a colpi di "no grazie": un muro morbido che si apre solo
 * quando vinci la trattativa a tempo.
 */
export class Seller extends Entity {
  private sprite!: Phaser.GameObjects.Sprite;
  private stall!: Phaser.GameObjects.Image;
  private facing: 1 | -1 = -1;
  private triggered = false;
  private done = false;

  override create(): void {
    this.y = this.def.y ?? GROUND_Y;
    this.facing = (this.def.facing ?? -1) as 1 | -1;
    const src = actorSource("seller");

    this.stall = this.host.add
      .image(this.x - this.facing * 16, this.y, "prop:stall")
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.entities - 1);

    this.sprite = this.host.add
      .sprite(this.x, this.y, src.textureKey, 0)
      .setOrigin(src.origin[0], src.origin[1])
      .setScale(src.scale)
      .setDepth(DEPTH.entities)
      .setFlipX(this.facing === -1);
    this.sprite.play(animKey("seller", "offer"));
  }

  override update(dt: number): void {
    const player = this.host.player;

    if (this.done) {
      // si sposta e ti lascia passare
      this.x += this.facing * 12 * dt;
      this.sprite.x = Math.round(this.x);
      return;
    }

    const dx = player.x - this.x;

    // muro morbido: ti ferma ma non ti ferisce
    if (Math.abs(dx) < 9 && !player.isTripping) {
      const side = Math.sign(dx) || -1;
      player.sprite.x = this.x + side * 9;
      player.block();
    }

    if (!this.triggered && Math.abs(dx) < 26) {
      this.triggered = true;
      const hard = this.bool("hard");
      this.host.startEncounter({
        lines: SELLER_LINES,
        replies: hard ? 4 : 3,
        windowMs: hard ? 1050 : 1400,
        onWin: () => {
          this.done = true;
          this.stall.setDepth(DEPTH.entities - 2);
          this.sprite.play(animKey("seller", "walk"));
          this.host.say("\u00ab...vabbu\u00f2. Buona giornata!\u00bb", "#55ff55");
        },
        onMiss: () => this.host.hurt("Hai esitato. Ora ne vuole vendere due paia.")
      });
    }
  }

  override destroy(): void {
    this.sprite.destroy();
    this.stall.destroy();
  }
}
