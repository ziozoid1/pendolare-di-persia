import Phaser from "phaser";
import { queueAssets, registerActorAnims } from "../art/atlas";
import { currentSkinName, skinFileURL, type SkinManifest } from "../art/skin";
import { centerText } from "../ui/text";

const MANIFEST_KEY = "skin:manifest";

/**
 * Due fasi di caricamento.
 * 1) preload: solo lo skin.json, se e' stato chiesto uno skin con ?skin=nome.
 * 2) create: si sa cosa e' sovrascritto, quindi si cuoce il resto dal rig e
 *    si mette tutto in coda in un secondo giro di loader.
 *
 * Il punto: sheet cotti dal rig e PNG esterni passano dalla stessa coda. Per
 * il gioco sono la stessa cosa.
 */
export class BootScene extends Phaser.Scene {
  private skinName: string | null = null;

  constructor() {
    super("Boot");
  }

  preload(): void {
    centerText(this, 96, "CARICAMENTO", "#aaaaaa");
    this.skinName = currentSkinName();
    if (!this.skinName) return;

    this.load.json(MANIFEST_KEY, skinFileURL(this.skinName, "skin.json"));
    this.load.once("loaderror", () => {
      console.warn(`skin "${this.skinName}" non trovato: si usa la grafica procedurale`);
      this.skinName = null;
    });
  }

  create(): void {
    let skin: SkinManifest | null = null;
    if (this.skinName && this.cache.json.exists(MANIFEST_KEY)) {
      skin = this.cache.json.get(MANIFEST_KEY) as SkinManifest;
      // il nome nel manifest deve combaciare con la cartella
      skin = { ...skin, name: skin.name ?? this.skinName };
    }
    this.registry.set("skin", skin);

    queueAssets(this, skin);
    this.load.once("complete", () => {
      registerActorAnims(this);
      this.scene.start("Title");
    });
    this.load.start();
  }
}
