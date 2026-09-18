import Phaser from "phaser";
import {
  CLOCK_MINUTES_PER_MS, DEPTH, GAME_H, GAME_W, GROUND_Y
} from "../core/constants";
import type { StageDef } from "../core/types";
import { SOLID } from "../art/atlas";
import { createBackdrop, type Backdrop } from "../art/backdrop/Backdrop";
import type { SkinManifest } from "../art/skin";
import { Player } from "../player/Player";
import { spawnEntity } from "../entities/registry";
import type { Entity, StageHost } from "../entities/Entity";
import { Encounter, type EncounterOptions } from "../ui/Encounter";
import { HUD } from "../ui/HUD";
import { showOverlay } from "../ui/Overlay";

type StageState = "play" | "lost" | "won";

/**
 * Tutto cio' che gli stage hanno in comune: orologio, pazienza, camera a
 * schermate fisse, pavimento a segmenti, entita', trattative, fine partita.
 * Un nuovo stage = una sottoclasse con un solo campo, `def`.
 */
export abstract class StageScene extends Phaser.Scene implements StageHost {
  abstract readonly def: StageDef;

  player!: Player;
  protected hud!: HUD;
  private backdrop!: Backdrop;
  private entities: Entity[] = [];
  private floorGroup!: Phaser.Physics.Arcade.StaticGroup;
  private encounter: Encounter | null = null;
  private overlayObjects: Phaser.GameObjects.GameObject[] = [];

  private state: StageState = "play";
  private clock = 0;
  private patience = 3;
  private lastSafeX = 0;
  private objective: { ratio: number; label: string } | null = null;
  private restartKey!: Phaser.Input.Keyboard.Key;

  get isPlaying(): boolean {
    return this.state === "play" && this.encounter === null;
  }

  get stageSkin(): string | undefined {
    return this.def.skin;
  }

  private get screens(): number {
    return Math.max(1, Math.round(this.def.width / GAME_W));
  }

  create(): void {
    this.hud = new HUD(this); // istanza fresca ad ogni restart: nessuno stato stantio
    this.state = "play";
    this.clock = this.def.clockStart;
    this.patience = this.def.patience;
    this.entities = [];
    this.overlayObjects = [];
    this.encounter = null;
    this.lastSafeX = this.def.startX;
    this.objective = null;

    // La skin per il fondale: se lo stage ha una skin propria la usa,
    // altrimenti cade sulla skin globale (o null → procedurale).
    const stageSkin: SkinManifest | null = this.def.skin
      ? (this.registry.get(`skin:manifest:${this.def.skin}`) ?? null)
      : (this.registry.get("skin") ?? null);
    this.backdrop = createBackdrop(this.def.backdrop, stageSkin);
    this.backdrop.build(this, this.def.width);

    this.physics.world.setBounds(0, 0, this.def.width, GAME_H + 260);
    this.buildFloor();

    this.player = new Player(this, this.def.startX, GROUND_Y - 2);
    this.player.sprite.setDepth(DEPTH.player);
    this.physics.add.collider(this.player.sprite, this.floorGroup);

    this.hud.create(this.patience);
    this.hud.setClock(this.clock, false, 0);
    this.hud.setPatience(this.patience);
    this.hud.setLaptop(true);

    for (const def of this.def.entities) {
      const e = spawnEntity(this, def);
      if (e) this.entities.push(e);
    }

    this.cameras.main.setBounds(0, 0, this.def.width, GAME_H);
    this.cameras.main.setScroll(0, 0);

    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

    // M alterna il muto globale (persiste tra le scene grazie al SoundManager condiviso)
    this.input.keyboard!.on("keydown-M", () => {
      this.sound.mute = !this.sound.mute;
      this.hud.setMuted(this.sound.mute);
    });

    this.hud.setMuted(this.sound.mute);

    this.showStageTitle();
  }

  private buildFloor(): void {
    this.floorGroup = this.physics.add.staticGroup();
    for (const seg of this.def.floor) {
      const body = this.floorGroup
        .create(seg.x + seg.w / 2, GROUND_Y + 8, SOLID.black) as Phaser.GameObjects.Image;
      body.setDisplaySize(seg.w, 16).setVisible(false);
      (body as unknown as Phaser.Physics.Arcade.Sprite).refreshBody();
    }
  }

  private showStageTitle(): void {
    const objs = showOverlay(this, [this.def.title, this.def.subtitle, "", "spazio per iniziare"], "#ffff55");
    this.overlayObjects = objs;
    this.physics.world.pause();
    this.input.keyboard!.once("keydown-SPACE", () => {
      for (const o of this.overlayObjects) o.destroy();
      this.overlayObjects = [];
      this.physics.world.resume();
      // Altrimenti lo spazio appena premuto viene letto come un salto.
      const kb = this.input.keyboard;
      if (kb && typeof kb.resetKeys === "function") kb.resetKeys();
    });
  }

  update(time: number, delta: number): void {
    const dt = Math.min(delta, 50) / 1000;
    const cam = this.cameras.main;

    this.backdrop.update(cam.scrollX, time);
    this.hud.update(dt);

    // R a meta' partita: riavvia subito (JustDown funziona con fisica attiva)
    if (this.state === "play" && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.start(this.def.key);
      return;
    }

    // Fine partita: i listener once() in lose() / completeStage() gestiscono le transizioni
    if (this.state !== "play") return;
    if (this.overlayObjects.length > 0) return; // titolo dello stage ancora a schermo

    // orologio
    this.clock += delta * CLOCK_MINUTES_PER_MS;
    if (this.clock >= this.def.clockDeadline) {
      this.lose("TROPPO TARDI. IL MANAGER HA GIA' CHIAMATO.");
      return;
    }
    const late = this.clock > this.def.clockDeadline - 10;
    this.hud.setClock(this.clock, late, time);

    // trattativa in corso: il mondo aspetta
    if (this.encounter) {
      this.player.freeze();
      this.encounter.update(dt, this.player.consumeNo());
      if (this.encounter.finished) this.encounter = null;
    } else {
      this.player.update(dt);
      for (const e of this.entities) e.update(dt);
      if (this.player.onGround) this.lastSafeX = this.player.x;
    }

    this.checkPit();

    // camera a schermate fisse: nessuno scorrimento morbido, come nel 1989
    const screen = Math.floor(this.player.x / GAME_W);
    cam.setScroll(Math.min(screen * GAME_W, this.def.width - GAME_W), 0);

    this.reportProgress(screen);
  }

  /**
   * Di default la barra misura la distanza dall'uscita. Gli stage che non sono
   * corse orizzontali (fila agli ascensori, giro delle scrivanie) la
   * reinterpretano sovrascrivendo questo metodo.
   */
  protected reportProgress(screenIndex: number): void {
    if (this.objective) {
      this.hud.setProgress(Phaser.Math.Clamp(this.objective.ratio, 0, 1));
      this.hud.setStatus(this.objective.label);
      return;
    }
    this.hud.setProgress(Phaser.Math.Clamp(this.player.x / (this.def.width - 40), 0, 1));
    this.hud.setStatus(`SCHERMATA ${screenIndex + 1}/${this.screens}`);
  }

  setObjective(ratio: number, label: string): void {
    this.objective = { ratio, label };
  }

  private checkPit(): void {
    if (this.player.y < GAME_H + 20) return;
    this.player.sprite.setPosition(Math.max(this.def.startX, this.lastSafeX - 24), GROUND_Y - 30);
    (this.player.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.hurt("Buca. Al Centro Direzionale sono un classico.");
  }

  // ---- API per le entita' ------------------------------------------------

  startEncounter(options: EncounterOptions): void {
    if (this.encounter) return;
    this.encounter = new Encounter(this, options);
    this.encounter.create();
  }

  say(message: string, color = "#ffffff"): void {
    this.hud.say(message, color);
  }

  hurt(reason: string): void {
    if (this.state !== "play") return;
    this.patience--;
    this.hud.setPatience(Math.max(0, this.patience));
    this.cameras.main.shake(120, 0.008);
    if (this.patience <= 0) {
      this.lose("HAI PERSO LA PAZIENZA.");
      return;
    }
    this.say(reason, "#ffff55");
  }

  lose(reason: string): void {
    if (this.state !== "play") return;
    this.state = "lost";
    this.encounter?.destroy();
    this.encounter = null;
    this.hud.setLaptop(!reason.includes("PORTATILE"));
    this.physics.world.pause();
    this.overlayObjects = showOverlay(this, [reason, "", "R per ricominciare"], "#ff5555");
    // window.location.reload() garantisce uno stato pulito: nessun residuo di Phaser
    this.input.keyboard!.once("keydown-R", () => window.location.reload());
  }

  completeStage(): void {
    if (this.state !== "play") return;
    this.state = "won";
    this.physics.world.pause();
    const m = Math.floor(this.clock);
    const hhmm = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    this.overlayObjects = showOverlay(
      this,
      [`${this.def.title} COMPLETATA`, `Ore ${hhmm}.`, "", "spazio per continuare"],
      "#55ff55"
    );
    this.input.keyboard!.once("keydown-SPACE", () => this.scene.start(this.def.next));
  }
}
