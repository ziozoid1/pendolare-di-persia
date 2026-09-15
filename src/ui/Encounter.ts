import Phaser from "phaser";
import { DEPTH, GAME_W } from "../core/constants";
import { SOLID } from "../art/atlas";
import { centerText } from "./text";

export interface EncounterOptions {
  lines: string[];
  /** Quanti "no grazie" servono per chiudere la trattativa. */
  replies: number;
  /** Tempo disponibile per ogni risposta, in millisecondi. */
  windowMs: number;
  onWin: () => void;
  onMiss: () => void;
}

/**
 * Trattativa a tempo: il giocatore e' immobile e deve rispondere entro la
 * finestra, come in uno scambio di stoccate. Se lascia scadere il tempo,
 * perde pazienza e la finestra si riapre.
 */
export class Encounter {
  private panel: Phaser.GameObjects.Image[] = [];
  private lineText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private barFill!: Phaser.GameObjects.Image;
  private left: number;
  private timer: number;
  private lineIdx = 0;
  finished = false;

  constructor(private readonly scene: Phaser.Scene, private readonly opts: EncounterOptions) {
    this.left = opts.replies;
    this.timer = opts.windowMs / 1000;
  }

  create(): void {
    const top = 26;
    const add = (o: Phaser.GameObjects.Image) =>
      this.panel.push(o.setScrollFactor(0).setDepth(DEPTH.overlay));

    add(this.scene.add.image(20, top, SOLID.panel).setOrigin(0, 0).setDisplaySize(GAME_W - 40, 30));
    add(this.scene.add.image(20, top, SOLID.lgray).setOrigin(0, 0).setDisplaySize(GAME_W - 40, 1));
    add(this.scene.add.image(20, top + 29, SOLID.dgray).setOrigin(0, 0).setDisplaySize(GAME_W - 40, 1));
    add(this.scene.add.image(30, top + 26, SOLID.dim).setOrigin(0, 0).setDisplaySize(GAME_W - 60, 2));
    this.barFill = this.scene.add
      .image(30, top + 26, SOLID.lgreen)
      .setOrigin(0, 0)
      .setDisplaySize(GAME_W - 60, 2)
      .setScrollFactor(0)
      .setDepth(DEPTH.overlay + 1);

    this.lineText = centerText(this.scene, top + 4, this.opts.lines[0] ?? "", "#55ffff")
      .setScrollFactor(0).setDepth(DEPTH.overlay + 1);
    this.hintText = centerText(this.scene, top + 16, this.hint(), "#ffff55")
      .setScrollFactor(0).setDepth(DEPTH.overlay + 1);
  }

  private hint(): string {
    return `premi  N  per dire \u00abno grazie\u00bb  (${this.left})`;
  }

  /** Va chiamata solo mentre la trattativa e' aperta. */
  update(dt: number, noPressed: boolean): void {
    if (this.finished) return;

    if (noPressed) {
      this.left--;
      this.timer = this.opts.windowMs / 1000;
      if (this.left <= 0) {
        this.finished = true;
        this.opts.onWin();
        this.destroy();
        return;
      }
      this.lineIdx = (this.lineIdx + 1) % this.opts.lines.length;
      this.lineText.setText(this.opts.lines[this.lineIdx] ?? "");
      this.hintText.setText(this.hint());
      return;
    }

    this.timer -= dt;
    const ratio = Math.max(0, this.timer / (this.opts.windowMs / 1000));
    const w = Math.max(1, Math.round((GAME_W - 60) * ratio));
    this.barFill.setDisplaySize(w, 2);
    this.barFill.setTexture(ratio < 0.25 ? SOLID.lred : SOLID.lgreen);

    if (this.timer <= 0) {
      this.timer = this.opts.windowMs / 1000;
      this.opts.onMiss();
    }
  }

  destroy(): void {
    for (const p of this.panel) p.destroy();
    this.lineText.destroy();
    this.hintText.destroy();
    this.barFill.destroy();
    this.panel = [];
  }
}
