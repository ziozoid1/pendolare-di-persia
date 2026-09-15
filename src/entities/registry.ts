import type { EntityDef } from "../core/types";
import { ElevatorHall } from "./ElevatorHall";
import { ExitGate } from "./ExitGate";
import { Seller } from "./Seller";
import { Suitcase } from "./Suitcase";
import { Thief } from "./Thief";
import { Tourist } from "./Tourist";
import type { Entity, EntityCtor, StageHost } from "./Entity";

/**
 * Aggiungere un ostacolo agli stage successivi = una classe nuova e una riga
 * qui. Le "buche" dello stage 2 non sono entita': sono varchi nel pavimento,
 * quindi vivono in StageDef.floor.
 */
export const ENTITY_KINDS: Record<string, EntityCtor> = {
  case: Suitcase,      // valigia
  barrier: Suitcase,   // transenna dei lavori (stessa logica, texture diversa)
  tourist: Tourist,
  seller: Seller,
  thief: Thief,
  exit: ExitGate,
  "elevator-hall": ElevatorHall // stage 3: fila, cabine, scavalcatori
};

export function spawnEntity(host: StageHost, def: EntityDef): Entity | null {
  const Ctor = ENTITY_KINDS[def.kind];
  if (!Ctor) {
    console.warn(`Entita' sconosciuta: "${def.kind}"`);
    return null;
  }
  const e = new Ctor(host, def);
  e.create();
  return e;
}
