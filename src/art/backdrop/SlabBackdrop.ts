import Phaser from "phaser";
import { DEPTH, GAME_H, GROUND_Y } from "../../core/constants";
import type { Backdrop } from "./Backdrop";

/**
 * Fondale falso-3D alla Prince of Persia 1989.
 *
 * La profondita' viene dall'occlusione e dallo spessore dei volumi, non dalla
 * parallasse: tutto e' in world space (scrollFactor 1 di default).
 * L'indizio piu' forte e' la colonna in primo piano (DEPTH.overFloor): passa
 * davanti al giocatore esattamente come nell'originale.
 */
export class SlabBackdrop implements Backdrop {
  build(scene: Phaser.Scene, levelWidth: number): void {
    scene.cameras.main.setBackgroundColor("#000000");

    // Archi nella parete di fondo (occlusione dello sfondo)
    for (let x = 80; x < levelWidth; x += 192) {
      scene.add.image(x, 0, "prop:arch")
        .setOrigin(0, 0)
        .setDepth(DEPTH.farBack);
    }

    // Colonne di sfondo (dietro il giocatore)
    for (let x = 32; x < levelWidth; x += 128) {
      scene.add.image(x, 0, "prop:pillar")
        .setOrigin(0, 0)
        .setDepth(DEPTH.columns);
    }

    // Pavimento: faccia superiore (quota GROUND_Y, 4 px)
    scene.add.tileSprite(0, GROUND_Y, levelWidth, 4, "prop:slab_top")
      .setOrigin(0, 0)
      .setDepth(DEPTH.props);

    // Pavimento: faccia frontale (sotto il bordo, fino al fondo schermo)
    scene.add.tileSprite(0, GROUND_Y + 4, levelWidth, GAME_H - GROUND_Y - 4, "prop:slab_face")
      .setOrigin(0, 0)
      .setDepth(DEPTH.props);

    // Colonne in primo piano: DAVANTI al giocatore (DEPTH.overFloor)
    for (let x = 280; x < levelWidth; x += 640) {
      scene.add.image(x, 0, "prop:pillar")
        .setOrigin(0, 0)
        .setDepth(DEPTH.overFloor);
    }
  }

  update(_scrollX: number, _timeMs: number): void {
    // Nessuna parallasse: i game object seguono la camera con scrollFactor 1.
  }
}
