/** Risoluzione interna: identica a quella EGA del Prince of Persia originale. */
export const GAME_W = 320;
export const GAME_H = 200;

/** Quota del pavimento in coordinate di gioco. */
export const GROUND_Y = 168;

/** Profondita' di rendering: tenere tutto qui evita sorprese di ordinamento. */
export const DEPTH = {
  sky: -100,
  farBack: -90,
  trains: -80,
  canopy: -70,
  board: -60,
  columns: -50,
  props: -10,
  entities: 0,
  player: 10,
  overFloor: 20,
  hud: 1000,
  overlay: 1100
} as const;

/** Fisica in pixel/secondo, derivata dal prototipo a 60 fps. */
export const PHYS = {
  walkSpeed: 57,
  runSpeed: 111,
  gravity: 1080,
  jumpVelocity: -261,
  accel: 0.25
} as const;

/** Un minuto di orologio di gioco ogni 3 secondi reali. */
export const CLOCK_MINUTES_PER_MS = (20 / 60) / 1000;
