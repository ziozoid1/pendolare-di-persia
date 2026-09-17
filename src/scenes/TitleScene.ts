import Phaser from "phaser";
import { GAME_H } from "../core/constants";
import { actorSource } from "../art/atlas";
import { animKey } from "../art/clips";
import { centerText } from "../ui/text";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super("Title");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#101028");

    centerText(this, 34, "IL PENDOLARE DI PERSIA", "#ffff55");
    centerText(this, 50, "TECNU-CARE  \u2022  Torre Valerio, 32\u00b0 piano", "#aaaaaa");

    // il protagonista cammina sul posto: e' sempre lo stesso rig
    const src = actorSource("hero");
    const hero = this.add
      .sprite(160, 130, src.textureKey, 0)
      .setOrigin(0.5, 1)
      .setScale(src.scale * 2);
    hero.play(animKey("hero", "walk"));

    centerText(this, 142, "\u2190 \u2192 camminare   shift correre   \u2191 saltare", "#8a8a96");
    centerText(this, 152, "\u2193 borsa al petto   N \u00abno grazie\u00bb", "#8a8a96");

    const start = centerText(this, GAME_H - 26, "premi spazio", "#55ff55");
    this.tweens.add({ targets: start, alpha: 0.2, duration: 700, yoyo: true, repeat: -1 });

    // ?stage=N (1-3): salta direttamente a quello stage in sviluppo
    const stageParam = new URLSearchParams(window.location.search).get("stage");
    const stageN = stageParam ? parseInt(stageParam, 10) : NaN;
    const targetScene = stageN >= 1 && stageN <= 3 ? `Stage${stageN}` : "Stage1";

    if (stageN >= 1 && stageN <= 3) {
      centerText(this, GAME_H - 8, `DEV: stage ${stageN}`, "#ff8800").setAlpha(0.7);
    }

    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start(targetScene));
  }
}
