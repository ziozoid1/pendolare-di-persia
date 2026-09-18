import Phaser from "phaser";
import { DEPTH, GAME_W } from "../core/constants";
import { actorSource, SOLID } from "../art/atlas";
import { animKey } from "../art/clips";
import { pixelText } from "./text";
import { LUOGHI } from "../data/luoghi";

const CLOUD_W = 74;

type Showable = { setVisible(v: boolean): void; destroy(): void };

export class MapOverlay {
  private objects: Showable[] = [];
  private clouds: Array<{ img: Phaser.GameObjects.Image; speed: number }> = [];
  private open_ = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly luogoIndex: number | undefined
  ) {}

  build(): void {
    const D = DEPTH.overlay;

    // Fondale
    this.push(
      this.scene.add.image(0, 0, "map:bg").setOrigin(0, 0).setScrollFactor(0).setDepth(D)
    );

    // Nuvole (tre frame dal foglio, sopra la mappa ma sotto il segnalino)
    const cloudDefs = [
      { frame: 0, x:  60, y:   6, speed: 2.5 },
      { frame: 1, x: 196, y: 104, speed: 3.5 },
      { frame: 2, x: 250, y: 146, speed: 4.5 },
    ];
    for (const c of cloudDefs) {
      const img = this.scene.add
        .image(c.x, c.y, "map:nuvole", c.frame)
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setDepth(D + 1);
      this.clouds.push({ img, speed: c.speed });
      this.push(img);
    }

    // Segnalino: solo se lo stage dichiara un luogo
    const luogo = this.luogoIndex !== undefined ? LUOGHI[this.luogoIndex] : undefined;
    if (luogo) {
      const src = actorSource("hero");
      const hw = Math.ceil((src.frameWidth  * src.scale) / 2);
      const hh = Math.ceil( src.frameHeight * src.scale);

      // Contorno 1px (rectangle tratteggiata attorno alla sagoma)
      const outline = this.scene.add.graphics().setScrollFactor(0).setDepth(D + 2);
      outline.lineStyle(1, 0xd0d8ff, 1);
      outline.strokeRect(luogo.x - hw - 1, luogo.y - hh - 1, hw * 2 + 2, hh + 2);
      this.push(outline);

      // Sprite eroe
      const hero = this.scene.add
        .sprite(luogo.x, luogo.y, src.textureKey, 0)
        .setOrigin(src.origin[0], src.origin[1])
        .setScale(src.scale)
        .setScrollFactor(0)
        .setDepth(D + 3);
      hero.play(animKey("hero", "walk"));
      this.push(hero);

      // Targa scura col nome del luogo
      const label = pixelText(this.scene, luogo.x, luogo.y + 2, luogo.nome, "#e0e0ff")
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(D + 3);
      const lw = Math.ceil(label.width) + 6;
      const labelBg = this.scene.add
        .image(luogo.x, luogo.y + 1, SOLID.panel)
        .setOrigin(0.5, 0)
        .setDisplaySize(lw, 9)
        .setScrollFactor(0)
        .setDepth(D + 2);
      this.push(labelBg);
      this.push(label);
    }

    // Nasce nascosta
    this.applyVisible(false);
  }

  open(): void {
    this.open_ = true;
    this.applyVisible(true);
  }

  close(): void {
    this.open_ = false;
    this.applyVisible(false);
  }

  get isOpen(): boolean { return this.open_; }

  update(dt: number): void {
    for (const c of this.clouds) {
      c.img.x += c.speed * dt;
      if (c.img.x > GAME_W + CLOUD_W / 2) c.img.x = -CLOUD_W / 2;
    }
  }

  destroy(): void {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.clouds = [];
  }

  private push(o: Showable): void { this.objects.push(o); }

  private applyVisible(v: boolean): void {
    for (const o of this.objects) o.setVisible(v);
  }
}
