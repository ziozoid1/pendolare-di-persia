import Phaser from "phaser";
import { DEPTH, GAME_H, GROUND_Y } from "../../core/constants";
import type { Backdrop } from "./Backdrop";

/**
 * Fondale falso-3D alla Prince of Persia 1989.
 *
 * Tre piani di profondita' chiari, tutti in world space (scrollFactor 1):
 *   1. Parete di fondo: archi (DEPTH.farBack)
 *   2. Piano intermedio: lesene piatte (DEPTH.board)
 *   3. Colonne di sfondo (DEPTH.columns)
 *   4. Colonna in primo piano, davanti al giocatore (DEPTH.overFloor)
 *
 * La profondita' viene dall'occlusione e dalla larghezza della faccia
 * laterale delle colonne (10 px), non dal movimento dei piani.
 */
export class SlabBackdrop implements Backdrop {
  build(scene: Phaser.Scene, levelWidth: number): void {
    scene.cameras.main.setBackgroundColor("#000000");

    // Piano 1 — archi nella parete di fondo
    for (let x = 80; x < levelWidth; x += 192) {
      scene.add.image(x, 0, "prop:arch")
        .setOrigin(0, 0)
        .setDepth(DEPTH.farBack);
    }

    // Piano 2 — lesene piatte: piano intermedio tra parete e colonne
    for (let x = 48; x < levelWidth; x += 96) {
      scene.add.image(x, 0, "prop:lesena")
        .setOrigin(0, 0)
        .setDepth(DEPTH.board);
    }

    // Piano 3 — colonne di sfondo (dietro il giocatore)
    for (let x = 20; x < levelWidth; x += 160) {
      scene.add.image(x, 0, "prop:pillar")
        .setOrigin(0, 0)
        .setDepth(DEPTH.columns);
    }

    // Pavimento: faccia superiore (quota GROUND_Y, 4 px)
    scene.add.tileSprite(0, GROUND_Y, levelWidth, 4, "prop:slab_top")
      .setOrigin(0, 0)
      .setDepth(DEPTH.props);

    // Pavimento: faccia frontale (fino al fondo schermo)
    scene.add.tileSprite(0, GROUND_Y + 4, levelWidth, GAME_H - GROUND_Y - 4, "prop:slab_face")
      .setOrigin(0, 0)
      .setDepth(DEPTH.props);

    // Piano 4 — colonne in primo piano: DAVANTI al giocatore (DEPTH.overFloor)
    for (let x = 260; x < levelWidth; x += 640) {
      scene.add.image(x, 0, "prop:pillar")
        .setOrigin(0, 0)
        .setDepth(DEPTH.overFloor);
    }
  }

  update(_scrollX: number, _timeMs: number): void {
    // Nessuna parallasse: tutto segue la camera con scrollFactor 1.
  }
}
