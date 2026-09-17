import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W, GROUND_Y } from "../../core/constants";
import type { Backdrop } from "./Backdrop";

/**
 * Atrio della Torre Valerio. Una sola schermata, quindi niente parallasse:
 * la profondita' la danno il soffitto illuminato e il marmo della parete.
 */
export class LobbyBackdrop implements Backdrop {
  build(scene: Phaser.Scene, _levelWidth: number): void {
    scene.cameras.main.setBackgroundColor("#22223a");

    scene.add.tileSprite(0, 0, GAME_W, 30, "prop:lobby_ceiling")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.sky);

    scene.add.tileSprite(0, 30, GAME_W, GROUND_Y - 30, "prop:lobby_wall")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.farBack);

    scene.add.tileSprite(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y, "prop:lobby_floor")
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH.props);

    // un po' di arredo, per non avere una parete nuda
    scene.add.image(14, GROUND_Y, "prop:plant").setOrigin(0.5, 1).setDepth(DEPTH.props + 1);
    scene.add.image(112, GROUND_Y, "prop:plant").setOrigin(0.5, 1).setDepth(DEPTH.props + 1);
  }

  update(_scrollX: number, _timeMs: number): void {}
}
