import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W, GROUND_Y } from "../../core/constants";
import type { Backdrop } from "./Backdrop";

interface ParallaxLayer {
  sprite: Phaser.GameObjects.TileSprite;
  factor: number;
}

/**
 * Piazza Garibaldi, stazione di mattoni.
 *
 * Layout verticale:
 *   y   0-38  cielo freddo + catenaria   scrollFactor 0, factor 0.15
 *   y  38-46  cornice di cemento         scrollFactor 0, factor 0.35
 *   y  46-120 parete di mattoni          scrollFactor 0, factor 0.35
 *   y 120-168 pilastri in ombra banchina scrollFactor 0, factor 0.70
 *   y 168-176 bordo banchina + giallo    world space (scrollFactor 1)
 *   y 176-200 massicciata + rotaie       world space (scrollFactor 1)
 *
 * Elementi fissi a schermo (scrollFactor 0):
 *   - cartellone pubblicitario con lampade e coni di luce (setAlpha)
 *   - tabellone partenze (prop:board_on / off, lampeggio 500 ms)
 *   - treni animati nella zona binari
 */
export class GaribaldiBackdrop implements Backdrop {
  private layers: ParallaxLayer[] = [];
  private trains: Array<{ img: Phaser.GameObjects.Image; speed: number }> = [];
  private board?: Phaser.GameObjects.Image;

  build(scene: Phaser.Scene, levelWidth: number): void {
    const tile = (key: string, y: number, h: number, factor: number, depth: number) => {
      const s = scene.add
        .tileSprite(0, y, GAME_W, h, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(depth);
      this.layers.push({ sprite: s, factor });
      return s;
    };

    scene.cameras.main.setBackgroundColor("#96a8bc");

    // --- Cielo + catenaria (y 0-38) ---
    tile("prop:catenary", 0, 38, 0.15, DEPTH.sky);

    // --- Parete di mattoni (y 38-120) ---
    tile("prop:wall_cornice", 38, 8, 0.35, DEPTH.farBack);
    tile("prop:brick_wall", 46, 74, 0.35, DEPTH.farBack);

    // --- Cartellone pubblicitario (fisso a schermo, nella fascia y 42-94) ---
    const bbX = 50, bbY = 42;
    scene.add.image(bbX, bbY, "prop:billboard")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.board);

    // Tre lampade sopra il cartellone + coni di luce (setAlpha, NON tint)
    for (let i = 0; i < 3; i++) {
      const lx = bbX + 4 + i * 24;
      scene.add.image(lx, bbY - 7, "prop:billboard_lamp")
        .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.board + 1);
      scene.add.image(lx - 6, bbY, "prop:light_cone")
        .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.board + 1)
        .setAlpha(0.35);
    }

    // --- Tabellone partenze (mantenuto, fisso a schermo) ---
    this.board = scene.add.image(200, 48, "prop:board_on")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.board + 1);

    // --- Pilastri + zona in ombra banchina (y 120-168) ---
    tile("prop:platform_pillar", 120, 48, 0.70, DEPTH.columns);

    // --- Bordo banchina + striscia gialla (world space, segue la camera 1:1) ---
    scene.add.tileSprite(0, GROUND_Y, levelWidth, 8, "prop:platform_edge")
      .setOrigin(0, 0).setDepth(DEPTH.props);

    // --- Massicciata + rotaie (world space) ---
    scene.add.tileSprite(0, GROUND_Y + 8, levelWidth, GAME_H - GROUND_Y - 8, "prop:track_bed")
      .setOrigin(0, 0).setDepth(DEPTH.farBack);

    // --- Treni nella zona binari (fissi a schermo, loop automatico) ---
    // Due treni a velocità diverse: non si sovrappongono mai al giocatore
    // perché depth DEPTH.trains (-80) << DEPTH.player (10).
    const configs: Array<[number, number, number]> = [
      [30,           GROUND_Y + 9,  22],   // verso destra, veloce
      [GAME_W + 60,  GROUND_Y + 10, -14],  // verso sinistra, lento
    ];
    for (const [x, y, speed] of configs) {
      const img = scene.add.image(x, y, "prop:garibaldi_train")
        .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.trains);
      this.trains.push({ img, speed });
    }
  }

  update(scrollX: number, timeMs: number): void {
    for (const l of this.layers) l.sprite.tilePositionX = scrollX * l.factor;

    const dt = 1 / 60;
    for (const t of this.trains) {
      t.img.x += t.speed * dt;
      if (t.img.x > GAME_W + 20)  t.img.x = -145;
      if (t.img.x < -145)          t.img.x = GAME_W + 20;
    }

    this.board?.setTexture(Math.floor(timeMs / 500) % 2 === 0 ? "prop:board_on" : "prop:board_off");
  }
}
