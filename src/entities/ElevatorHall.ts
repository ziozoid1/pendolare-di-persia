import Phaser from "phaser";
import { DEPTH, GROUND_Y } from "../core/constants";
import { animKey } from "../art/clips";
import { actorSource } from "../art/atlas";
import { pixelText } from "../ui/text";
import type { ActorId, ClipName } from "../core/types";
import { Entity } from "./Entity";

/**
 * STAGE 3 - GLI ASCENSORI
 *
 * L'inversione rispetto agli altri stage: qui non si avanza, si resta.
 * Il tuo posto in fila e' uno slot; davanti allo slot c'e' un muro
 * invisibile, quindi superarlo e' impossibile. La fila avanza da sola quando
 * una cabina si riempie, e tu devi seguirla entro la tolleranza: se resti
 * indietro perdi il posto.
 *
 * Tre pressioni contemporanee:
 *  - le cabine arrivano con capienza variabile (a volte zero: piena);
 *  - chi va di fretta prova a scavalcarti e va respinto con N;
 *  - nuovi colleghi si accodano dietro, quindi tornare in fondo costa caro.
 */

const SLOT_W = 13;         // passo tra due posti
const MAX_LINE = 10;       // oltre questo la fila non cresce piu'
const TOLERANCE = 12;      // scarto ammesso dal proprio posto, in pixel
const DRIFT_GRACE = 1.3;   // secondi fuori posto prima di perderlo
const QUEUE_WALK = 34;     // velocita' con cui i personaggi si spostano

interface Person {
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  actor: ActorId;
  clip: ClipName | null;
}

type Member = Person | "player";

interface Cabin {
  x: number;
  door: Phaser.GameObjects.Image;
  panel: Phaser.GameObjects.Text;
  open: boolean;
  timer: number;
  cycle: number;
  capacity: number;
}

const CAPACITY_SEQUENCE = [2, 3, 0, 2, 4, 1, 3, 0];

const JUMPER_LINES = [
  "\u00abScusa, sto di fretta\u00bb",
  "\u00abDevo solo salire un attimo\u00bb",
  "\u00abTengo la call alle nove\u00bb",
  "\u00abTanto tu aspetti, no?\u00bb"
];

export class ElevatorHall extends Entity {
  private frontX = 222;
  private line: Member[] = [];
  private leaving: Array<Person & { targetX: number }> = [];
  private cabins: Cabin[] = [];

  private marker!: Phaser.GameObjects.Image;
  private jumperBubble!: Phaser.GameObjects.Text;

  private jumper: Person | null = null;
  private jumperState: "none" | "approach" | "asking" = "none";
  private jumperTimer = 6;
  private spawnTimer = 5;
  private driftTimer = 0;
  private protestCooldown = 0;
  private capIndex = 0;
  private boarded = false;

  override create(): void {
    this.frontX = this.num("frontX", 222);

    // due porte: gli arrivi si alternano, la fila e' una sola
    const doors = [this.num("doorA", 250), this.num("doorB", 292)];
    doors.forEach((x, i) => {
      const door = this.host.add
        .image(x, GROUND_Y, "prop:lift_closed")
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.props + 2);
      this.host.add
        .image(x, GROUND_Y - 54, "prop:lift_panel")
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.props + 2);
      const panel = pixelText(this.host, x, GROUND_Y - 62, "", "#ffff55")
        .setOrigin(0.5, 0)
        .setDepth(DEPTH.props + 3);

      const cycle = this.num("cabinCycle", 8.5);
      this.cabins.push({
        x, door, panel,
        open: false,
        cycle,
        timer: cycle * (i === 0 ? 0.55 : 1),
        capacity: 0
      });
    });

    // impronte verdi: il posto che devi tenere
    this.marker = this.host.add
      .image(this.frontX, GROUND_Y - 1, "prop:queue_mark")
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.props + 1)
      .setVisible(false);

    this.jumperBubble = pixelText(this.host, 0, 0, "", "#55ffff")
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.entities + 2)
      .setVisible(false);

    // la fila che trovi arrivando
    const initial = Math.max(0, Math.round(this.num("initialQueue", 4)));
    for (let i = 0; i < initial; i++) {
      const p = this.makePerson("colleague", this.slotX(i));
      this.line.push(p);
    }

    this.host.say("Mettiti in fila. In fondo, non davanti.", "#ffff55");
  }

  // ---- geometria della fila ----------------------------------------------

  private slotX(slot: number): number {
    return this.frontX - slot * SLOT_W;
  }

  private get playerSlot(): number {
    return this.line.indexOf("player");
  }

  private get inLine(): boolean {
    return this.playerSlot >= 0;
  }

  private get tailX(): number {
    return this.slotX(this.line.length);
  }

  private makePerson(actor: ActorId, x: number): Person {
    const src = actorSource(actor);
    const sprite = this.host.add
      .sprite(x, GROUND_Y, src.textureKey, 0)
      .setOrigin(src.origin[0], src.origin[1])
      .setScale(src.scale)
      .setDepth(DEPTH.entities);
    const person: Person = { sprite, x, actor, clip: null };
    this.playPerson(person, "idle");
    return person;
  }

  private playPerson(person: Person, clip: ClipName): void {
    if (person.clip === clip) return;
    person.sprite.play(animKey(person.actor, clip), true);
    person.clip = clip;
  }

  /** Avvicina una persona al suo posto e scegli la clip di conseguenza. */
  private stepPerson(person: Person, targetX: number, dt: number, speed = QUEUE_WALK): void {
    const dx = targetX - person.x;
    if (Math.abs(dx) < 0.8) {
      person.x = targetX;
      this.playPerson(person, "idle");
      person.sprite.setFlipX(false);
    } else {
      const dir = Math.sign(dx);
      person.x += dir * speed * dt;
      this.playPerson(person, "walk");
      person.sprite.setFlipX(dir < 0);
    }
    person.sprite.x = Math.round(person.x);
  }

  // ---- ciclo principale ---------------------------------------------------

  override update(dt: number): void {
    if (this.boarded) return;

    this.updateCabins(dt);
    this.updateQueuePositions(dt);
    this.updatePlayerSlot(dt);
    this.updateJumper(dt);
    this.updateNewcomers(dt);
    this.updateLeaving(dt);
    this.reportObjective();
  }

  private updateCabins(dt: number): void {
    for (const cabin of this.cabins) {
      cabin.timer -= dt;

      if (!cabin.open) {
        const ratio = Phaser.Math.Clamp(cabin.timer / cabin.cycle, 0, 1);
        cabin.panel.setText(String(1 + Math.round(33 * ratio)));
        cabin.panel.setColor("#ffff55");
        if (cabin.timer <= 0) this.openCabin(cabin);
      } else {
        if (cabin.timer <= 0) {
          cabin.open = false;
          cabin.timer = cabin.cycle;
          cabin.door.setTexture("prop:lift_closed");
        }
      }
    }
  }

  private openCabin(cabin: Cabin): void {
    cabin.open = true;
    cabin.timer = 2.6;
    cabin.door.setTexture("prop:lift_open");
    cabin.capacity = CAPACITY_SEQUENCE[this.capIndex % CAPACITY_SEQUENCE.length] ?? 2;
    this.capIndex++;

    if (cabin.capacity === 0) {
      cabin.panel.setText("X").setColor("#ff5555");
      this.host.say("\u00abPiena. Aspettate la prossima.\u00bb", "#ff5555");
      return;
    }
    cabin.panel.setText("\u25cf".repeat(Math.min(cabin.capacity, 4))).setColor("#55ff55");

    const taken = this.line.splice(0, cabin.capacity);
    for (const member of taken) {
      if (member === "player") {
        // gli altri saliti con te escono di scena insieme alla schermata
        for (const rest of taken) if (rest !== "player") rest.sprite.destroy();
        this.boardPlayer(cabin);
        return;
      }
      this.leaving.push({ ...member, targetX: cabin.x });
    }
  }

  private boardPlayer(cabin: Cabin): void {
    this.boarded = true;
    this.marker.setVisible(false);
    this.jumperBubble.setVisible(false);
    this.host.player.sprite.x = cabin.x;
    this.host.completeStage();
  }

  /** Ognuno si sposta verso il proprio slot: cosi' la fila "scorre". */
  private updateQueuePositions(dt: number): void {
    this.line.forEach((member, slot) => {
      if (member === "player") return;
      this.stepPerson(member, this.slotX(slot), dt);
    });
  }

  private updatePlayerSlot(dt: number): void {
    const player = this.host.player;
    this.protestCooldown = Math.max(0, this.protestCooldown - dt);

    if (!this.inLine) {
      this.marker.setVisible(false);
      const tail = this.tailX;

      if (Math.abs(player.x - tail) < 10) {
        this.line.push("player");
        this.driftTimer = 0;
        this.host.say("In fila. Adesso non muoverti.", "#55ff55");
        return;
      }

      // muro morbido: non si passa davanti a chi aspetta
      if (player.x > tail + 12) {
        player.sprite.x = tail + 12;
        player.block();
        if (this.protestCooldown <= 0) {
          this.protestCooldown = 2.5;
          this.host.hurt("\u00abGuagli\u00f2, e la fila?!\u00bb");
        }
      }
      return;
    }

    const slot = this.playerSlot;
    const targetX = this.slotX(slot);
    this.marker.setVisible(true).setPosition(Math.round(targetX), GROUND_Y - 1);

    // non si scavalca nemmeno il proprio posto
    if (player.x > targetX + 10) {
      player.sprite.x = targetX + 10;
      player.block();
    }

    const off = Math.abs(player.x - targetX);
    if (off > TOLERANCE) {
      this.driftTimer += dt;
      if (this.driftTimer > DRIFT_GRACE) {
        this.line.splice(slot, 1);
        this.driftTimer = 0;
        this.host.hurt("Ti sei allontanato. Posto perso.");
      }
    } else {
      this.driftTimer = 0;
    }
  }

  // ---- chi va di fretta ---------------------------------------------------

  private updateJumper(dt: number): void {
    if (this.jumperState === "none") {
      if (!this.inLine) return;
      this.jumperTimer -= dt;
      if (this.jumperTimer <= 0) {
        this.spawnJumper();
      }
      return;
    }

    const jumper = this.jumper;
    if (!jumper) {
      this.jumperState = "none";
      return;
    }

    const slot = this.playerSlot;
    const goalX = slot >= 0 ? this.slotX(slot) + 4 : this.frontX;

    if (this.jumperState === "approach") {
      this.stepPerson(jumper, goalX, dt, 52);
      this.jumperBubble.setVisible(false);
      if (Math.abs(jumper.x - goalX) < 2) {
        this.jumperState = "asking";
        this.jumperTimer = 1.5;
        const line = JUMPER_LINES[Math.floor(Math.random() * JUMPER_LINES.length)] ?? JUMPER_LINES[0]!;
        this.jumperBubble.setText(line).setVisible(true);
      }
    } else {
      this.jumperTimer -= dt;
      this.jumperBubble.setPosition(Math.round(jumper.x), GROUND_Y - 44);
      this.playPerson(jumper, "reach");

      if (this.host.player.consumeNo()) {
        this.rejectJumper(jumper);
        return;
      }
      if (this.jumperTimer <= 0) this.acceptJumper(jumper);
    }
  }

  private spawnJumper(): void {
    const jumper = this.makePerson("manager", -14);
    this.jumper = jumper;
    this.jumperState = "approach";
    this.jumperBubble.setVisible(false);
  }

  /** Respinto: si accoda in fondo come tutti. */
  private rejectJumper(jumper: Person): void {
    this.jumperBubble.setVisible(false);
    this.jumper = null;
    this.jumperState = "none";
    this.jumperTimer = Phaser.Math.Between(5, 9);
    if (this.line.length < MAX_LINE) {
      this.line.push(jumper);
    } else {
      jumper.sprite.destroy();
    }
    this.host.say("\u00ab...ah, scusa. Non avevo visto.\u00bb", "#55ff55");
  }

  /** Riuscito: si infila davanti a te e tu prendi una gomitata indietro. */
  private acceptJumper(jumper: Person): void {
    this.jumperBubble.setVisible(false);
    this.jumper = null;
    this.jumperState = "none";
    this.jumperTimer = Phaser.Math.Between(5, 9);

    const slot = this.playerSlot;
    if (slot < 0) {
      jumper.sprite.destroy();
      return;
    }
    this.line.splice(slot, 0, jumper);
    this.host.player.sprite.x -= SLOT_W;
    this.driftTimer = 0;
    this.host.say("Ti ha scavalcato.", "#ffff55");
  }

  // ---- ricambio della fila e uscite --------------------------------------

  private updateNewcomers(dt: number): void {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = Phaser.Math.FloatBetween(3.5, 6);
    if (this.line.length >= MAX_LINE) return;
    this.line.push(this.makePerson("colleague", -14));
  }

  private updateLeaving(dt: number): void {
    for (let i = this.leaving.length - 1; i >= 0; i--) {
      const p = this.leaving[i]!;
      this.stepPerson(p, p.targetX, dt, 60);
      p.sprite.setAlpha(Phaser.Math.Clamp(Math.abs(p.targetX - p.x) / 12, 0.15, 1));
      if (Math.abs(p.x - p.targetX) < 1.5) {
        p.sprite.destroy();
        this.leaving.splice(i, 1);
      }
    }
  }

  private reportObjective(): void {
    const slot = this.playerSlot;
    if (slot < 0) {
      this.host.setObjective(0, "NON IN FILA");
      return;
    }
    const ratio = 1 - slot / MAX_LINE;
    this.host.setObjective(ratio, `IN FILA: ${slot + 1}\u00b0`);
  }

  override destroy(): void {
    for (const m of this.line) if (m !== "player") m.sprite.destroy();
    for (const p of this.leaving) p.sprite.destroy();
    this.jumper?.sprite.destroy();
    this.marker.destroy();
    this.jumperBubble.destroy();
    for (const c of this.cabins) {
      c.door.destroy();
      c.panel.destroy();
    }
  }
}
