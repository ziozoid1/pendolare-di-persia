import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W } from "../core/constants";
import { SOLID } from "../art/atlas";
import { centerText } from "./text";

/** Pannello di fine stage: sconfitta, vittoria, titoli. */
export function showOverlay(
  scene: Phaser.Scene, lines: string[], accent = "#ff5555"
): Phaser.GameObjects.GameObject[] {
  const made: Phaser.GameObjects.GameObject[] = [];
  const top = Math.round(GAME_H / 2 - lines.length * 5);

  const dim = scene.add.image(0, 0, SOLID.black)
    .setOrigin(0, 0).setDisplaySize(GAME_W, GAME_H)
    .setAlpha(0.72).setScrollFactor(0).setDepth(DEPTH.overlay);
  const panel = scene.add.image(30, top - 10, SOLID.panel)
    .setOrigin(0, 0).setDisplaySize(GAME_W - 60, lines.length * 10 + 20)
    .setScrollFactor(0).setDepth(DEPTH.overlay + 1);
  made.push(dim, panel);

  lines.forEach((line, i) => {
    const t = centerText(scene, top + i * 10, line, i === 0 ? accent : "#aaaaaa")
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 2);
    made.push(t);
  });

  return made;
}
