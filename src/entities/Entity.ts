import Phaser from "phaser";
import type { EntityDef } from "../core/types";
import type { Player } from "../player/Player";
import type { EncounterOptions } from "../ui/Encounter";

/**
 * Quello che un'entita' puo' chiedere allo stage. Tenerlo come interfaccia
 * (e non come import della classe) evita import circolari e rende le entita'
 * testabili da sole.
 */
export interface StageHost extends Phaser.Scene {
  readonly player: Player;
  readonly isPlaying: boolean;
  /** Nome della skin dello stage, se dichiarata in StageDef.skin. */
  readonly stageSkin: string | undefined;
  hurt(reason: string): void;
  lose(reason: string): void;
  completeStage(): void;
  say(message: string, color?: string): void;
  /** Reinterpreta la barra della HUD: 0..1 piu' etichetta. */
  setObjective(ratio: number, label: string): void;
  startEncounter(options: EncounterOptions): void;
}

export abstract class Entity {
  protected readonly host: StageHost;
  readonly def: EntityDef;
  x: number;
  y: number;

  constructor(host: StageHost, def: EntityDef) {
    this.host = host;
    this.def = def;
    this.x = def.x;
    this.y = def.y ?? 0;
  }

  abstract create(): void;
  update(_dtSec: number): void {}
  destroy(): void {}

  /** Distanza orizzontale dal giocatore, con segno (positivo = giocatore a destra). */
  protected dxFromPlayer(): number {
    return this.host.player.x - this.x;
  }

  protected num(key: string, fallback: number): number {
    const v = this.def[key];
    return typeof v === "number" ? v : fallback;
  }

  protected bool(key: string, fallback = false): boolean {
    const v = this.def[key];
    return typeof v === "boolean" ? v : fallback;
  }
}

export type EntityCtor = new (host: StageHost, def: EntityDef) => Entity;
