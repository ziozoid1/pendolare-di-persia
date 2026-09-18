import Phaser from "phaser";
import { MapOverlay } from "../ui/MapOverlay";

export class MapScene extends Phaser.Scene {
  private overlay!: MapOverlay;

  constructor() {
    super("Map");
  }

  create(): void {
    const lastLuogo = this.registry.get("lastLuogo") as number | undefined;
    this.overlay = new MapOverlay(this, lastLuogo, (scena) => {
      this.overlay.close();
      this.scene.start(scena);
    });
    this.overlay.build();
    this.overlay.open();

    const kb = this.input.keyboard!;
    kb.on("keydown-M",   () => this.scene.start("Title"));
    kb.on("keydown-ESC", () => this.scene.start("Title"));
  }

  update(_time: number, delta: number): void {
    this.overlay.update(Math.min(delta, 50) / 1000);
  }
}
