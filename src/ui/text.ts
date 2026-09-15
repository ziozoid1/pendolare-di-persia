import Phaser from "phaser";

export const FONT_FAMILY = 'ui-monospace, "DejaVu Sans Mono", monospace';

/** Testo a 8px: con pixelArt attivo resta sgranato come si deve. */
export function pixelText(
  scene: Phaser.Scene, x: number, y: number, text: string,
  color = "#ffffff", size = 8
): Phaser.GameObjects.Text {
  return scene.add
    .text(Math.round(x), Math.round(y), text, {
      fontFamily: FONT_FAMILY,
      fontSize: `${size}px`,
      color
    })
    .setOrigin(0, 0);
}

export function centerText(
  scene: Phaser.Scene, y: number, text: string, color = "#ffffff", size = 8
): Phaser.GameObjects.Text {
  const t = pixelText(scene, 0, y, text, color, size);
  t.setOrigin(0.5, 0);
  t.x = Math.round(scene.scale.width / 2);
  return t;
}
