import Phaser from "phaser";
import { queueAssets, queueSkinActors, queueSkinBackdrops, registerActorAnims, registerSkinActorAnims } from "../art/atlas";
import { currentSkinName, skinFileURL, type SkinManifest } from "../art/skin";
import { centerText } from "../ui/text";
import { ALL_STAGES } from "../levels";

const MANIFEST_KEY = "skin:manifest";
const perStageKey = (name: string) => `skin:manifest:${name}`;

/**
 * Due fasi di caricamento.
 * 1) preload: skin.json globale + i manifest delle skin per-stage dichiarate
 *    negli stage (StageDef.skin).
 * 2) create: si sa cosa e' sovrascritto → si cuoce il resto dal rig, si
 *    caricano le immagini dei fondali per-stage, si parte.
 *
 * Sheet cotti dal rig e PNG esterni passano dalla stessa coda. Per il gioco
 * sono la stessa cosa. Gli attori vengono sempre dalla skin globale; le skin
 * per-stage sovrascrivono solo il fondale del loro stage.
 */
export class BootScene extends Phaser.Scene {
  private skinName: string | null = null;

  constructor() {
    super("Boot");
  }

  preload(): void {
    centerText(this, 96, "CARICAMENTO", "#aaaaaa");
    this.load.audio("ost", ["music/ost.ogg", "music/ost.mp3"]);
    this.skinName = currentSkinName();
    if (this.skinName) {
      this.load.json(MANIFEST_KEY, skinFileURL(this.skinName, "skin.json"));
      this.load.once("loaderror", () => {
        console.warn(`skin "${this.skinName}" non trovato: si usa la grafica procedurale`);
        this.skinName = null;
      });
    }

    // Pre-carica i manifest delle skin per-stage (quelle diverse dalla globale)
    const perStageNames = new Set(
      ALL_STAGES.map(s => s.skin).filter((s): s is string => !!s && s !== this.skinName)
    );
    for (const name of perStageNames) {
      this.load.json(perStageKey(name), skinFileURL(name, "skin.json"));
    }
  }

  create(): void {
    let skin: SkinManifest | null = null;
    if (this.skinName && this.cache.json.exists(MANIFEST_KEY)) {
      skin = this.cache.json.get(MANIFEST_KEY) as SkinManifest;
      skin = { ...skin, name: skin.name ?? this.skinName };
    }
    this.registry.set("skin", skin);

    queueAssets(this, skin);

    // Registra le skin per-stage e accoda le loro immagini di fondale
    const perStageNames = new Set(
      ALL_STAGES.map(s => s.skin).filter((s): s is string => !!s && s !== this.skinName)
    );
    const loadedPerStage: string[] = [];
    for (const name of perStageNames) {
      const key = perStageKey(name);
      if (this.cache.json.exists(key)) {
        const raw = this.cache.json.get(key) as SkinManifest;
        const manifest: SkinManifest = { ...raw, name: raw.name ?? name };
        this.registry.set(key, manifest);
        queueSkinBackdrops(this, manifest);
        queueSkinActors(this, manifest);
        loadedPerStage.push(name);
      }
    }

    this.load.once("complete", () => {
      registerActorAnims(this);
      for (const name of loadedPerStage) {
        registerSkinActorAnims(this, name);
      }
      this.scene.start("Title");
    });
    this.load.start();
  }
}
