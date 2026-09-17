import Phaser from "phaser";
import { GAME_W, GAME_H } from "../core/constants";
import { actorSource } from "../art/atlas";
import { animKey } from "../art/clips";
import { centerText, FONT_FAMILY } from "../ui/text";
import { CREDITI } from "../data/crediti";

type PanelState = "menu" | "opzioni" | "crediti";

const LABELS = ["START", "OPZIONI", "CREDITI"] as const;
const ITEM_Y  = [146, 162, 178] as const;

export class TitleScene extends Phaser.Scene {
  private selected   = 0;
  private panelState: PanelState = "menu";

  private menuBg!: Phaser.GameObjects.Graphics;
  private menuTexts: Phaser.GameObjects.Text[]      = [];
  private menuHits:  Phaser.GameObjects.Rectangle[] = [];

  private dimRect!: Phaser.GameObjects.Rectangle;
  private subObjs:  Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("Title");
  }

  create(): void {
    // ── musica ───────────────────────────────────────────────────────────
    if (!this.sound.get("ost")?.isPlaying) {
      this.sound.add("ost", { loop: true, volume: 0.4 }).play();
    }

    // ── sfondo ──────────────────────────────────────────────────────────
    if (this.textures.exists("screen:title")) {
      this.add.image(0, 0, "screen:title").setOrigin(0, 0);
    } else {
      this.cameras.main.setBackgroundColor("#101028");
      centerText(this, 34, "IL PENDOLARE DI PERSIA", "#ffff55");
      centerText(this, 50, "TECNU-CARE  •  Torre Valerio, 32° piano", "#aaaaaa");
      const src = actorSource("hero");
      this.add
        .sprite(Math.round(GAME_W / 2), 126, src.textureKey, 0)
        .setOrigin(0.5, 1)
        .setScale(src.scale * 2)
        .play(animKey("hero", "walk"));
    }

    // ── label DEV stage ──────────────────────────────────────────────────
    const stageN = this.readStageN();
    if (stageN >= 1 && stageN <= 3) {
      centerText(this, GAME_H - 8, `DEV: stage ${stageN}`, "#ff8800").setAlpha(0.7);
    }

    // ── menu ─────────────────────────────────────────────────────────────
    this.menuBg = this.add.graphics().setDepth(10);

    for (let i = 0; i < LABELS.length; i++) {
      const t = this.add
        .text(Math.round(GAME_W / 2), Math.round(ITEM_Y[i] + 6), LABELS[i], {
          fontFamily: FONT_FAMILY,
          fontSize: "8px",
          color: "#ffffff",
        })
        .setOrigin(0.5, 0.5)
        .setDepth(12);
      this.menuTexts.push(t);

      const hit = this.add
        .rectangle(Math.round(GAME_W / 2), ITEM_Y[i] + 6, 80, 12, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(11);
      const idx = i;
      hit.on("pointerover", () => {
        if (this.panelState !== "menu") return;
        this.selected = idx;
        this.redrawMenu();
      });
      hit.on("pointerdown", () => {
        if (this.panelState !== "menu") return;
        this.selected = idx;
        this.confirm();
      });
      this.menuHits.push(hit);
    }

    this.redrawMenu();

    // ── overlay scuro (sotto-schermate) ───────────────────────────────────
    this.dimRect = this.add
      .rectangle(0, 0, GAME_W, GAME_H, 0x000000, 0)
      .setOrigin(0, 0)
      .setDepth(50)
      .setVisible(false);

    // ── tastiera ──────────────────────────────────────────────────────────
    const kb = this.input.keyboard!;
    kb.on("keydown-UP",    () => this.moveMenu(-1));
    kb.on("keydown-DOWN",  () => this.moveMenu(+1));
    kb.on("keydown-SPACE", () => { if (this.panelState === "menu") this.confirm(); else this.closePanel(); });
    kb.on("keydown-ENTER", () => { if (this.panelState === "menu") this.confirm(); else this.closePanel(); });
    kb.on("keydown-ESC",   () => this.closePanel());
  }

  // ── menu ─────────────────────────────────────────────────────────────────

  private redrawMenu(): void {
    this.menuBg.clear();
    for (let i = 0; i < LABELS.length; i++) {
      const sel = i === this.selected;
      const tw  = Math.ceil(this.menuTexts[i].width);
      const bw  = tw + 18;
      const bx  = Math.round((GAME_W - bw) / 2);
      const by  = ITEM_Y[i];

      this.menuBg.fillStyle(0x0c0e1a, 0.85);
      this.menuBg.fillRect(bx, by, bw, 12);
      this.menuBg.lineStyle(1, sel ? 0xf0e296 : 0x76746c, 1);
      this.menuBg.strokeRect(bx + 0.5, by + 0.5, bw - 1, 11);

      this.menuTexts[i].setColor(sel ? "#ffe88c" : "#c6c2b6");
      this.menuHits[i].setPosition(Math.round(GAME_W / 2), by + 6).setSize(bw, 12);
    }
  }

  private moveMenu(dir: 1 | -1): void {
    if (this.panelState !== "menu") return;
    this.selected = (this.selected + dir + LABELS.length) % LABELS.length;
    this.redrawMenu();
  }

  private confirm(): void {
    if (this.selected === 0) {
      const n = this.readStageN();
      this.scene.start(n >= 1 && n <= 3 ? `Stage${n}` : "Stage1");
    } else if (this.selected === 1) {
      this.openPanel("opzioni");
    } else {
      this.openPanel("crediti");
    }
  }

  // ── sotto-schermate ───────────────────────────────────────────────────────

  private openPanel(which: "opzioni" | "crediti"): void {
    this.panelState = which;
    this.dimRect.setFillStyle(0x000000, 0.65).setVisible(true).setInteractive();
    this.dimRect.once("pointerdown", () => this.closePanel());

    const lines = which === "opzioni" ? this.opzioniLines() : this.creditiLines();
    let y = Math.round((GAME_H - lines.length * 10) / 2);
    for (const [text, color] of lines) {
      this.subObjs.push(centerText(this, y, text, color).setDepth(60));
      y += 10;
    }
  }

  private closePanel(): void {
    if (this.panelState === "menu") return;
    this.panelState = "menu";
    this.dimRect.setVisible(false).disableInteractive();
    for (const o of this.subObjs) o.destroy();
    this.subObjs = [];
  }

  private opzioniLines(): Array<[string, string]> {
    return [
      ["OPZIONI",                        "#f0e296"],
      ["",                               "#c6c2b6"],
      ["FRECCE          MUOVERSI",       "#c6c2b6"],
      ["SHIFT           CORRERE",        "#c6c2b6"],
      ["SU / SPAZIO     SALTARE",        "#c6c2b6"],
      ["GIU             BORSA AL PETTO", "#c6c2b6"],
      ["N               PARLARE",        "#c6c2b6"],
      ["R               RICOMINCIARE",   "#c6c2b6"],
      ["",                               "#c6c2b6"],
      ["VOLUME MUSICA   [presto]",       "#555566"],
      ["VOLUME EFFETTI  [presto]",       "#555566"],
      ["",                               "#c6c2b6"],
      ["ESC PER TORNARE",                "#f0e296"],
    ];
  }

  private creditiLines(): Array<[string, string]> {
    const lines: Array<[string, string]> = [
      ["CREDITI", "#f0e296"],
      ["",        "#c6c2b6"],
    ];
    for (const c of CREDITI) {
      lines.push([c.ruolo.toUpperCase(), "#888888"]);
      lines.push([c.nome.toUpperCase(),  "#c6c2b6"]);
      lines.push(["",                    "#c6c2b6"]);
    }
    lines.push(["ESC PER TORNARE", "#f0e296"]);
    return lines;
  }

  // ── helpers ───────────────────────────────────────────────────────────────

  private readStageN(): number {
    const p = new URLSearchParams(window.location.search).get("stage");
    return p ? parseInt(p, 10) : NaN;
  }
}
