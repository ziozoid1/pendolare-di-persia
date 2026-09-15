import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { animKey } from "../art/clips";
import { actorSource } from "../art/atlas";
import { pixelText } from "../ui/text";
import { Entity } from "./Entity";

type Phase = "patrol" | "wind" | "lunge" | "flee";
type Side = 1 | -1;

const opposite = (s: Side): Side => (s === 1 ? -1 : 1);

/**
 * Ladro di portatili. Telegrafa l'affondo con un "!" per tre quarti di
 * secondo: la difesa e' premere giu' al momento giusto per stringere la borsa
 * al petto. Stessa grammatica della parata del PoP.
 */
export class Thief extends Entity {
  private sprite!: Phaser.GameObjects.Sprite;
  private warn!: Phaser.GameObjects.Text;
  private phase: Phase = "patrol";
  private timer = 0;
  private home = 0;
  private range = 46;
  private fleeDir: Side = 1;
  private elapsed = 0;

  override create(): void {
    this.y = this.def.y ?? GROUND_Y;
    this.home = this.x;
    this.range = this.num("range", 46);
    const src = actorSource("thief");

    this.sprite = this.host.add
      .sprite(this.x, this.y, src.textureKey, 0)
      .setOrigin(src.origin[0], src.origin[1])
      .setScale(src.scale)
      .setDepth(DEPTH.entities);
    this.sprite.play(animKey("thief", "walk"));

    this.warn = pixelText(this.host, this.x, this.y - 46, "!", "#ff5555")
      .setOrigin(0.5, 0)
      .setDepth(DEPTH.entities + 1)
      .setVisible(false);
  }

  override update(dt: number): void {
    this.elapsed += dt;
    const player = this.host.player;
    const dx = player.x - this.x;
    const side = (Math.sign(dx) || 1) as Side;

    switch (this.phase) {
      case "patrol":
        this.x = this.home + Math.sin(this.elapsed * 0.85) * 14;
        this.sprite.play(animKey("thief", "walk"), true);
        if (Math.abs(dx) < this.range) {
          this.phase = "wind";
          this.timer = 0.73;
          this.sprite.play(animKey("thief", "reach"), true);
        }
        break;

      case "wind":
        this.timer -= dt;
        this.x += side * 33 * dt;
        this.warn.setVisible(Math.floor(this.timer * 8) % 2 === 0);
        if (this.timer <= 0) {
          this.phase = "lunge";
          this.timer = 0.27;
          this.warn.setVisible(false);
          this.sprite.play(animKey("thief", "run"), true);
        }
        break;

      case "lunge":
        this.timer -= dt;
        this.x += side * 102 * dt;
        if (Math.abs(player.x - this.x) < 14) {
          if (player.isDucking) {
            this.startFlee(opposite(side));
            this.host.say("Borsa stretta al petto. Niente da fare.", "#55ff55");
          } else {
            this.host.lose("TI HANNO PRESO IL PORTATILE.");
            return;
          }
        }
        if (this.timer <= 0) this.startFlee(opposite(side));
        break;

      case "flee":
        this.x += this.fleeDir * 132 * dt;
        if (Math.abs(this.x - player.x) > 220) this.host.say("", "#ffffff");
        break;
    }

    this.sprite.x = Math.round(this.x);
    this.sprite.setFlipX((this.phase === "flee" ? this.fleeDir : side) === -1);
    this.warn.x = Math.round(this.x);
  }

  private startFlee(dir: Side): void {
    this.phase = "flee";
    this.fleeDir = dir;
    this.warn.setVisible(false);
    this.sprite.play(animKey("thief", "run"), true);
  }

  override destroy(): void {
    this.sprite.destroy();
    this.warn.destroy();
  }
}
