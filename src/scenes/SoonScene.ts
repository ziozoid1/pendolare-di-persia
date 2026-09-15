import Phaser from "phaser";
import { centerText } from "../ui/text";

/**
 * Segnaposto per gli stage non ancora costruiti. Tiene in piedi la catena
 * delle scene (ogni stage sa qual e' il prossimo) e documenta a schermo cosa
 * va implementato.
 */
export class SoonScene extends Phaser.Scene {
  constructor(
    key: string,
    private readonly title: string,
    private readonly notes: string[],
    private readonly next: string | null
  ) {
    super(key);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#101028");
    centerText(this, 26, this.title, "#ffff55");
    this.notes.forEach((n, i) => centerText(this, 52 + i * 11, n, "#8a8a96"));

    if (this.next) {
      centerText(this, 172, "spazio per andare avanti", "#55ff55");
      this.input.keyboard!.once("keydown-SPACE", () => this.scene.start(this.next!));
    } else {
      centerText(this, 172, "R per tornare al titolo", "#55ff55");
      this.input.keyboard!.once("keydown-R", () => this.scene.start("Title"));
    }
  }
}

/** Le tre tappe centrali piu' il finale, con le note di progettazione. */
export function buildRemainingScenes(): SoonScene[] {
  return [
    new SoonScene(
      "Stage3",
      "STAGE 3 - GLI ASCENSORI",
      [
        "Fare la fila correttamente, non farsi",
        "scavalcare da chi va di fretta.",
        "Serve: entita' coda (posizione in fila),",
        "cabine con capienza, tasto per tenere il posto."
      ],
      "Stage4"
    ),
    new SoonScene(
      "Stage4",
      "STAGE 4 - IL BADGE",
      [
        "Badge, permesso di rete, autorizzazione al piano.",
        "Non e' un platform lineare: e' un grafo di stanze",
        "con stato sui documenti ottenuti e un timer di",
        "sospetto dei manager che ti vogliono in postazione."
      ],
      "Stage5"
    ),
    new SoonScene(
      "Stage5",
      "STAGE 5 - LA POSTAZIONE",
      [
        "32\u00b0 piano. I posti liberi si esauriscono nel tempo:",
        "ogni scrivania ha un timer di occupazione e i",
        "colleghi la puntano con un percorso proprio.",
        "Vince chi si siede prima."
      ],
      "Finale"
    ),
    new SoonScene(
      "Finale",
      "FINALE",
      [
        "Il manager si avvicina, sorride e dice:",
        "\u00abma lo sai che potevi fare smart working?\u00bb",
        "",
        "Schermata fissa, dialogo a comparsa lettera per",
        "lettera, taglio a nero, titoli di coda."
      ],
      null
    )
  ];
}
