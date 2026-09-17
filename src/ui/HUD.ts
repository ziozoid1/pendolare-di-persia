import Phaser from "phaser";
import { DEPTH, GAME_W } from "../core/constants";
import { SOLID } from "../art/atlas";
import { pixelText, centerText } from "./text";

/** Orologio, pazienza, portatile, avanzamento: tutto ancorato allo schermo. */
export class HUD {
  private clock!: Phaser.GameObjects.Text;
  private pips: Phaser.GameObjects.Image[] = [];
  private progressFill!: Phaser.GameObjects.Image;
  private screenLabel!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private messageTimer = 0;
  private laptop!: Phaser.GameObjects.Image;
  private maxPatience = 3;
  private muteLabel!: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {}

  create(maxPatience: number): void {
    this.maxPatience = maxPatience;
    this.pips = []; // scene.restart() distrugge i GameObjects ma non azzera l'array
    const fixed = <T extends Phaser.GameObjects.GameObject>(o: T): T =>
      (o as unknown as Phaser.GameObjects.Image).setScrollFactor(0).setDepth(DEPTH.hud) as unknown as T;

    this.clock = fixed(pixelText(this.scene, 4, 3, "08:32", "#ffffff"));
    fixed(pixelText(this.scene, 56, 3, "PAZIENZA", "#aaaaaa"));

    for (let i = 0; i < maxPatience; i++) {
      const pip = this.scene.add
        .image(110 + i * 8, 4, SOLID.lred)
        .setOrigin(0, 0)
        .setDisplaySize(6, 6);
      this.pips.push(fixed(pip));
    }

    fixed(pixelText(this.scene, 150, 3, "PORTATILE", "#aaaaaa"));
    this.laptop = fixed(
      this.scene.add.image(200, 4, SOLID.white).setOrigin(0, 0).setDisplaySize(9, 6)
    );

    fixed(this.scene.add.image(240, 5, SOLID.panel).setOrigin(0, 0).setDisplaySize(74, 4));
    this.progressFill = fixed(
      this.scene.add.image(240, 5, SOLID.lgreen).setOrigin(0, 0).setDisplaySize(1, 4)
    );
    this.screenLabel = fixed(pixelText(this.scene, 240, 12, "", "#6a6a80", 8));

    this.muteLabel = fixed(pixelText(this.scene, 216, 3, "MUTO", "#ff5555"));
    this.muteLabel.setVisible(false);

    this.message = fixed(centerText(this.scene, 150, "", "#ffffff"));
    this.message.setVisible(false);
  }

  setMuted(muted: boolean): void {
    this.muteLabel.setVisible(muted);
  }

  setClock(minutes: number, late: boolean, timeMs: number): void {
    const m = Math.floor(minutes);
    const txt = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    this.clock.setText(txt);
    const blink = late && Math.floor(timeMs / 250) % 2 === 0;
    this.clock.setColor(blink ? "#ff5555" : "#ffffff");
  }

  setPatience(value: number): void {
    this.pips.forEach((pip, i) => pip.setAlpha(i < value ? 1 : 0.2));
  }

  setLaptop(has: boolean): void {
    this.laptop.setTexture(has ? SOLID.white : SOLID.dim);
  }

  setProgress(ratio: number): void {
    this.progressFill.setDisplaySize(Math.max(1, Math.round(74 * ratio)), 4);
  }

  /** Riga sotto la barra: di default la schermata, negli stage a stanza il resto. */
  setStatus(text: string): void {
    this.screenLabel.setText(text);
  }

  /** Colore della barra: serve agli stage dove non misura una distanza. */
  setProgressColor(textureKey: string): void {
    this.progressFill.setTexture(textureKey);
  }

  say(text: string, color = "#ffffff"): void {
    if (text === "") {
      this.message.setVisible(false);
      return;
    }
    this.message.setText(text).setColor(color).setVisible(true);
    this.message.x = Math.round(GAME_W / 2);
    this.messageTimer = 2.5;
  }

  update(dt: number): void {
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      this.message.setAlpha(Math.min(1, this.messageTimer / 0.7));
      if (this.messageTimer <= 0) this.message.setVisible(false);
    }
  }
}
