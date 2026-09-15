import Phaser from "phaser";
import { PHYS } from "../core/constants";
import { actorSource } from "../art/atlas";
import { animKey } from "../art/clips";
import type { ClipName } from "../core/types";

const BODY_W = 11;
const BODY_H = 32;
const CROUCH_H = 20;

interface PlayerKeys {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  run: Phaser.Input.Keyboard.Key;
  no: Phaser.Input.Keyboard.Key;
}

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  facing: 1 | -1 = 1;
  hasLaptop = true;

  /** Frame di inciampata rimanenti: durante questi il giocatore non controlla. */
  private tripTimer = 0;
  private pushTimer = 0;
  private ducking = false;
  private keys: PlayerKeys;
  private clip: ClipName | null = null;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number) {
    const src = actorSource("hero");
    this.sprite = scene.physics.add.sprite(x, y, src.textureKey, 0);
    this.sprite.setOrigin(src.origin[0], src.origin[1]);
    this.sprite.setScale(src.scale);
    this.sprite.setDepth(10);

    const body = this.body;
    body.setSize(BODY_W, BODY_H, false);
    body.setOffset(src.frameWidth / 2 - BODY_W / 2, src.frameHeight - BODY_H - 2);
    body.setGravityY(PHYS.gravity);
    body.setMaxVelocityY(420);

    const kb = scene.input.keyboard;
    if (!kb) throw new Error("Tastiera non disponibile");
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      up: kb.addKey(K.UP),
      down: kb.addKey(K.DOWN),
      jump: kb.addKey(K.SPACE),
      run: kb.addKey(K.SHIFT),
      no: kb.addKey(K.N)
    };
    this.play("idle");
  }

  private get body(): Phaser.Physics.Arcade.Body {
    return this.sprite.body as Phaser.Physics.Arcade.Body;
  }

  get x(): number { return this.sprite.x; }
  get y(): number { return this.sprite.y; }
  get isDucking(): boolean { return this.ducking; }
  get isTripping(): boolean { return this.tripTimer > 0; }
  get onGround(): boolean { return this.body.blocked.down || this.body.touching.down; }

  /** Consuma la pressione del tasto "no grazie" (usato dalle trattative). */
  consumeNo(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.keys.no);
  }

  /** Blocca il giocatore contro un corpo morbido, tipo un turista fermo. */
  block(): void {
    this.pushTimer = 8;
  }

  /** Inciampata: perdita di controllo piu' contraccolpo. */
  trip(): void {
    if (this.tripTimer > 0) return;
    this.tripTimer = 42;
    this.body.setVelocityX(-70 * this.facing);
  }

  freeze(): void {
    this.body.setVelocityX(0);
    this.play("push");
  }

  update(_dt: number): void {
    const body = this.body;

    if (this.tripTimer > 0) {
      this.tripTimer--;
      body.setVelocityX(body.velocity.x * 0.9);
      this.play("trip");
      return;
    }

    const grounded = this.onGround;
    this.ducking = this.keys.down.isDown && grounded;

    let dir = 0;
    if (this.keys.left.isDown) dir -= 1;
    if (this.keys.right.isDown) dir += 1;
    if (this.ducking) dir = 0;
    if (dir !== 0) this.facing = dir as 1 | -1;

    const running = this.keys.run.isDown && !this.ducking;
    const target = dir * (running ? PHYS.runSpeed : PHYS.walkSpeed);
    body.setVelocityX(body.velocity.x + (target - body.velocity.x) * PHYS.accel);
    if (Math.abs(body.velocity.x) < 3) body.setVelocityX(0);

    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up);
    if (jumpPressed && grounded && !this.ducking) {
      body.setVelocityY(PHYS.jumpVelocity);
    }

    this.applyCrouchBody();
    this.sprite.setFlipX(this.facing === -1);

    // Scelta della clip: l'ordine delle condizioni e' la macchina a stati.
    const speed = Math.abs(body.velocity.x);
    if (!grounded) this.play(body.velocity.y < 0 ? "jump" : "fall");
    else if (this.ducking) this.play("crouch");
    else if (this.pushTimer > 0) { this.pushTimer--; this.play("push"); }
    else if (speed > 78) this.play("run", speed / PHYS.runSpeed);
    else if (speed > 8) this.play("walk", speed / PHYS.walkSpeed);
    else this.play("idle");
  }

  private applyCrouchBody(): void {
    const src = actorSource("hero");
    const h = this.ducking ? CROUCH_H : BODY_H;
    const body = this.body;
    if (Math.abs(body.height - h) < 0.5) return;
    body.setSize(BODY_W, h, false);
    body.setOffset(src.frameWidth / 2 - BODY_W / 2, src.frameHeight - h - 2);
  }

  /**
   * `timeScale` lega la velocita' dell'animazione a quella di movimento: e' la
   * versione leggera della locomozione guidata dall'animazione del PoP
   * originale. Per la versione integrale si ascolta ANIMATION_UPDATE e si
   * sposta il corpo di uno scarto per frame invece di usare la velocita'.
   */
  private play(clip: ClipName, timeScale = 1): void {
    if (this.clip !== clip) {
      this.sprite.play(animKey("hero", clip), true);
      this.clip = clip;
    }
    this.sprite.anims.timeScale = Phaser.Math.Clamp(timeScale, 0.45, 1.8);
  }
}
