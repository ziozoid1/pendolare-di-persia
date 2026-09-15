import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W, GROUND_Y } from "../../core/constants";
import type { Backdrop } from "./Backdrop";

interface ParallaxLayer {
  sprite: Phaser.GameObjects.TileSprite;
  factor: number;
}

/**
 * Piazza Garibaldi vista da dentro la stazione.
 * Ogni livello e' una TileSprite fissa allo schermo il cui tilePositionX
 * segue la camera con un fattore: la parallasse cosi' non si sfasa mai,
 * anche su livelli lunghi.
 */
export class StationBackdrop implements Backdrop {
  private layers: ParallaxLayer[] = [];
  private trains: Array<{ img: Phaser.GameObjects.Image; speed: number }> = [];
  private board?: Phaser.GameObjects.Image;

  build(scene: Phaser.Scene, _levelWidth: number): void {
    const tile = (key: string, y: number, h: number, factor: number, depth: number) => {
      const s = scene.add
        .tileSprite(0, y, GAME_W, h, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(depth);
      this.layers.push({ sprite: s, factor });
      return s;
    };

    scene.cameras.main.setBackgroundColor("#101028");

    tile("prop:skylights", 0, 34, 0.1, DEPTH.sky);
    tile("prop:canopy", 34, 26, 0.45, DEPTH.canopy);

    // binari: una fascia scura dove scorrono i treni
    scene.add.image(0, 60, "solid:panel").setOrigin(0, 0)
      .setDisplaySize(GAME_W, 52).setScrollFactor(0).setDepth(DEPTH.farBack);

    for (const [x, y, speed] of [[10, 74, 14], [230, 92, -9]] as Array<[number, number, number]>) {
      const img = scene.add.image(x, y, "prop:train")
        .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.trains);
      this.trains.push({ img, speed });
    }

    tile("prop:backwall", 112, 56, 0.5, DEPTH.board);
    this.board = scene.add.image(140, 114, "prop:board_on")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.board + 1);

    tile("prop:column", 92, 76, 0.8, DEPTH.columns);
    tile("prop:floor", GROUND_Y, GAME_H - GROUND_Y, 1, DEPTH.props);
  }

  update(scrollX: number, timeMs: number): void {
    for (const l of this.layers) l.sprite.tilePositionX = scrollX * l.factor;

    const dt = 1 / 60;
    for (const t of this.trains) {
      t.img.x += t.speed * dt;
      if (t.img.x > GAME_W + 30) t.img.x = -200;
      if (t.img.x < -200) t.img.x = GAME_W + 30;
    }

    this.board?.setTexture(Math.floor(timeMs / 500) % 2 === 0 ? "prop:board_on" : "prop:board_off");
  }
}
