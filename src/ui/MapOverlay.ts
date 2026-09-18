import Phaser from "phaser";
import { DEPTH, GAME_H, GAME_W } from "../core/constants";
import { actorSource, SOLID } from "../art/atlas";
import { animKey } from "../art/clips";
import { pixelText, centerText } from "./text";
import { LUOGHI, luogoDisponibile } from "../data/luoghi";

const CLOUD_W   = 74;
const WALK_SPEED = 60;  // px/s del segnalino sulla mappa
const IN_COSTRUZIONE_SEC = 2;

type Showable = { setVisible(v: boolean): void; destroy(): void };

interface LocationMark {
  dot:      Phaser.GameObjects.Image;
  targaBg:  Phaser.GameObjects.Image;
  targaTxt: Phaser.GameObjects.Text;
}

export class MapOverlay {
  private objects:  Showable[] = [];   // tutti tranne inCostrTxt
  private clouds:   Array<{ img: Phaser.GameObjects.Image; speed: number }> = [];
  private marks:    LocationMark[] = [];
  private hero!:    Phaser.GameObjects.Sprite;

  private inCostrTxt!: Phaser.GameObjects.Text;
  private open_ = false;

  // Stato cursore
  private currentIdx: number;
  private heroX = 0;
  private heroY = 0;
  private targetIdx = -1;   // -1 = fermo
  private srcX = 0; private srcY = 0;
  private dstX = 0; private dstY = 0;
  private walkLen = 0;
  private walked  = 0;
  private inCostrTimer = 0;

  // Riferimenti ai listener per poterli rimuovere
  private leftH!:  () => void;
  private rightH!: () => void;
  private enterH!: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    initialIndex: number | undefined,
    private readonly onSelectScene: (scena: string) => void
  ) {
    this.currentIdx = initialIndex ?? LUOGHI.length - 1;
  }

  // ---- setup ---------------------------------------------------------------

  build(): void {
    const D = DEPTH.overlay;

    // Fondale
    this.push(
      this.scene.add.image(0, 0, "map:bg")
        .setOrigin(0, 0).setScrollFactor(0).setDepth(D)
    );

    // Nuvole
    const cloudDefs = [
      { frame: 0, x:  60, y:   6, speed: 2.5 },
      { frame: 1, x: 196, y: 104, speed: 3.5 },
      { frame: 2, x: 250, y: 146, speed: 4.5 },
    ];
    for (const c of cloudDefs) {
      const img = this.scene.add
        .image(c.x, c.y, "map:nuvole", c.frame)
        .setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(D + 1);
      this.clouds.push({ img, speed: c.speed });
      this.push(img);
    }

    // Segnaposti statici per ogni luogo
    for (let i = 0; i < LUOGHI.length; i++) {
      const l = LUOGHI[i]!;
      const avail = luogoDisponibile(i);
      const nome     = avail ? l.nome : `(${l.nome})`;
      const dotTex   = avail ? SOLID.lgray : SOLID.dgray;
      const txtColor = avail ? "#9090a0" : "#555566";

      const dot = this.scene.add
        .image(l.x, l.y, dotTex)
        .setDisplaySize(4, 4).setOrigin(0.5, 0.5)
        .setScrollFactor(0).setDepth(D + 1);

      const targaTxt = pixelText(this.scene, l.x, l.y + 2, nome, txtColor)
        .setOrigin(0.5, 0).setScrollFactor(0).setDepth(D + 3);
      const lw = Math.ceil(targaTxt.width) + 6;
      const targaBg = this.scene.add
        .image(l.x, l.y + 1, SOLID.panel)
        .setOrigin(0.5, 0).setDisplaySize(lw, 9)
        .setScrollFactor(0).setDepth(D + 2);

      this.marks.push({ dot, targaBg, targaTxt });
      this.push(dot); this.push(targaBg); this.push(targaTxt);
    }

    // Segnalino mobile
    const src = actorSource("hero");

    this.hero = this.scene.add
      .sprite(0, 0, src.textureKey, 0)
      .setOrigin(src.origin[0], src.origin[1])
      .setScale(src.scale)
      .setScrollFactor(0).setDepth(D + 3);
    this.hero.play(animKey("hero", "walk"));
    this.push(this.hero);

    // "IN COSTRUZIONE" — non entra in objects, ha vita propria
    this.inCostrTxt = centerText(
      this.scene, Math.round(GAME_H * 0.75), "IN COSTRUZIONE", "#ffff55"
    ).setScrollFactor(0).setDepth(D + 4).setVisible(false);

    // Hint tastiera in basso
    this.push(
      centerText(
        this.scene, GAME_H - 10,
        "FRECCE PER SPOSTARSI   INVIO PER ENTRARE   M PER CHIUDERE",
        "#555566"
      ).setScrollFactor(0).setDepth(D + 1)
    );

    // Posizione iniziale
    this.snapToLocation(this.currentIdx);
    this.refreshMark(this.currentIdx, true);

    this.applyVisible(false);
  }

  // ---- apertura / chiusura ------------------------------------------------

  open(): void {
    this.open_ = true;
    this.inCostrTxt.setVisible(false);
    this.inCostrTimer = 0;
    this.applyVisible(true);

    const kb = this.scene.input.keyboard!;
    this.leftH  = () => this.navigate(-1);
    this.rightH = () => this.navigate( 1);
    this.enterH = () => this.select();
    kb.on("keydown-LEFT",  this.leftH);
    kb.on("keydown-RIGHT", this.rightH);
    kb.on("keydown-SPACE", this.enterH);
    kb.on("keydown-ENTER", this.enterH);
  }

  close(): void {
    this.open_ = false;
    this.applyVisible(false);
    this.inCostrTxt.setVisible(false);

    const kb = this.scene.input.keyboard!;
    kb.off("keydown-LEFT",  this.leftH);
    kb.off("keydown-RIGHT", this.rightH);
    kb.off("keydown-SPACE", this.enterH);
    kb.off("keydown-ENTER", this.enterH);
  }

  get isOpen(): boolean { return this.open_; }

  // ---- tick ----------------------------------------------------------------

  update(dt: number): void {
    // Nuvole
    for (const c of this.clouds) {
      c.img.x += c.speed * dt;
      if (c.img.x > GAME_W + CLOUD_W / 2) c.img.x = -CLOUD_W / 2;
    }

    // Spostamento cursore
    if (this.targetIdx >= 0) {
      this.walked += WALK_SPEED * dt;
      if (this.walked >= this.walkLen) {
        this.walked = this.walkLen;
        this.currentIdx = this.targetIdx;
        this.targetIdx = -1;
        this.hero.setFlipX(false);
      }
      const t = this.walkLen > 0 ? Math.min(1, this.walked / this.walkLen) : 1;
      this.heroX = Phaser.Math.Linear(this.srcX, this.dstX, t);
      this.heroY = Phaser.Math.Linear(this.srcY, this.dstY, t);
      this.redrawSegnalino();
    }

    // Timer IN COSTRUZIONE
    if (this.inCostrTimer > 0) {
      this.inCostrTimer -= dt;
      if (this.inCostrTimer <= 0) this.inCostrTxt.setVisible(false);
    }
  }

  destroy(): void {
    for (const o of this.objects) o.destroy();
    this.inCostrTxt?.destroy();
    this.objects = [];
    this.clouds  = [];
    this.marks   = [];
  }

  // ---- navigazione --------------------------------------------------------

  private navigate(dir: -1 | 1): void {
    if (this.targetIdx >= 0) return;  // già in cammino

    let next = this.currentIdx + dir;
    while (next >= 0 && next < LUOGHI.length && !luogoDisponibile(next)) next += dir;
    if (next < 0 || next >= LUOGHI.length) return;

    const dst = LUOGHI[next]!;
    this.refreshMark(this.currentIdx, false);
    this.refreshMark(next, true);

    this.srcX = this.heroX; this.srcY = this.heroY;
    this.dstX = dst.x;      this.dstY = dst.y;
    this.walkLen = Math.hypot(dst.x - this.srcX, dst.y - this.srcY);
    this.walked  = 0;
    this.targetIdx = next;
    this.hero.setFlipX(dst.x < this.srcX);
  }

  private select(): void {
    if (this.targetIdx >= 0) return;          // in cammino
    if (!luogoDisponibile(this.currentIdx)) return;

    const luogo = LUOGHI[this.currentIdx];
    if (!luogo) return;

    if (luogo.scena) {
      this.close();
      this.onSelectScene(luogo.scena);
    } else {
      this.inCostrTxt.setVisible(true);
      this.inCostrTimer = IN_COSTRUZIONE_SEC;
    }
  }

  // ---- helpers ------------------------------------------------------------

  private snapToLocation(idx: number): void {
    const l = LUOGHI[idx];
    if (!l) return;
    this.heroX = l.x;
    this.heroY = l.y;
    this.redrawSegnalino();
  }

  private redrawSegnalino(): void {
    this.hero.setPosition(Math.round(this.heroX), Math.round(this.heroY));
  }

  private refreshMark(idx: number, selected: boolean): void {
    const m = this.marks[idx];
    if (!m || !luogoDisponibile(idx)) return;  // bloccati: stile fisso
    m.dot.setTexture(selected ? SOLID.white : SOLID.lgray);
    m.targaTxt.setColor(selected ? "#e0e0ff" : "#9090a0");
  }

  private push(o: Showable): void { this.objects.push(o); }

  private applyVisible(v: boolean): void {
    for (const o of this.objects) o.setVisible(v);
  }
}
