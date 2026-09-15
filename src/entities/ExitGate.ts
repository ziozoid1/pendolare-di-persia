import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { pixelText } from "../ui/text";
import { Entity } from "./Entity";

/** Il varco che chiude lo stage. */
export class ExitGate extends Entity {
  private label!: Phaser.GameObjects.Text;
  private sub!: Phaser.GameObjects.Text;
  private blink = 0;
  private fired = false;

  override create(): void {
    this.y = this.def.y ?? GROUND_Y;
    this.host.add.image(this.x, this.y, "prop:exit").setOrigin(0.5, 1).setDepth(DEPTH.props + 1);
    const caption = typeof this.def.label === "string" ? this.def.label : "USCITA";
    const subtitle = typeof this.def.sublabel === "string" ? this.def.sublabel : "C.DIR.";
    this.label = pixelText(this.host, this.x, this.y - 54, caption, "#55ff55")
      .setOrigin(0.5, 0).setDepth(DEPTH.props + 2);
    this.sub = pixelText(this.host, this.x, this.y - 44, subtitle, "#aaaaaa")
      .setOrigin(0.5, 0).setDepth(DEPTH.props + 2);
  }

  override update(dt: number): void {
    this.blink += dt;
    this.label.setColor(Math.floor(this.blink * 2) % 2 === 0 ? "#55ff55" : "#00aa00");

    if (!this.fired && this.host.player.x > this.x - 6) {
      this.fired = true;
      this.host.completeStage();
    }
  }

  override destroy(): void {
    this.label.destroy();
    this.sub.destroy();
  }
}
