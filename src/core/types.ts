export type ActorId =
  | "hero"      // l'impiegato
  | "seller"    // venditore di calzini
  | "thief"     // ladro di portatili
  | "tourist"   // turista con valigia
  | "colleague" // collega che ti soffia la postazione (stage 5)
  | "manager"   // il manager del finale
  | "guard";    // addetto badge / reception (stage 4)

export const ACTOR_IDS: ActorId[] = [
  "hero", "seller", "thief", "tourist", "colleague", "manager", "guard"
];

/** Nome di una clip di animazione. Contratto condiviso tra rig e immagini esterne. */
export type ClipName =
  | "idle" | "walk" | "run" | "jump" | "fall"
  | "crouch" | "trip" | "push" | "offer" | "reach";

/** Un segmento di pavimento calpestabile. I varchi tra segmenti sono buche. */
export interface FloorSegment {
  x: number;
  w: number;
}

/** Definizione di un'entita' nel livello. `kind` seleziona la classe nel registry. */
export interface EntityDef {
  kind: string;
  x: number;
  y?: number;
  facing?: 1 | -1;
  [extra: string]: unknown;
}

export interface StageDef {
  key: string;
  title: string;
  subtitle: string;
  /** Larghezza in pixel. Tenerla multipla di GAME_W: la camera va a schermate fisse. */
  width: number;
  startX: number;
  floor: FloorSegment[];
  entities: EntityDef[];
  /** Orologio in minuti dalla mezzanotte. */
  clockStart: number;
  clockDeadline: number;
  patience: number;
  /** Chiave del fondale richiesto (vedi art/backdrop). */
  backdrop: string;
  /** Scene Phaser da avviare al completamento. */
  next: string;
  /** Skin da usare per il fondale di questo stage (sovrascrive la skin globale). */
  skin?: string;
  /** Indice in LUOGHI (src/data/luoghi.ts) per il segnalino sulla mappa. */
  luogo?: number;
}
