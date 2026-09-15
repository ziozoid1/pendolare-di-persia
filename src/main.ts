import Phaser from "phaser";
import { GAME_H, GAME_W } from "./core/constants";
import { BootScene } from "./scenes/BootScene";
import { TitleScene } from "./scenes/TitleScene";
import { Stage1Scene } from "./scenes/Stage1Scene";
import { Stage2Scene } from "./scenes/Stage2Scene";
import { Stage3Scene } from "./scenes/Stage3Scene";
import { buildRemainingScenes } from "./scenes/SoonScene";

/**
 * Scala solo a multipli interi: un fattore frazionario rovina la pixel art
 * anche col filtro nearest, perche' le righe di pixel finiscono di larghezza
 * diversa.
 */
function integerZoom(): number {
  const zx = Math.floor((window.innerWidth - 40) / GAME_W);
  const zy = Math.floor((window.innerHeight - 170) / GAME_H);
  return Math.max(1, Math.min(zx, zy));
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: GAME_W,
  height: GAME_H,
  zoom: integerZoom(),
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  physics: {
    default: "arcade",
    arcade: { gravity: { x: 0, y: 0 }, debug: false }
  },
  scene: [
    new BootScene(),
    new TitleScene(),
    new Stage1Scene(),
    new Stage2Scene(),
    new Stage3Scene(),
    ...buildRemainingScenes()
  ]
});

window.addEventListener("resize", () => game.scale.setZoom(integerZoom()));
