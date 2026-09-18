import Phaser from "phaser";

type State = "attesa" | "arrivo" | "allarme" | "zampata" | "fuga" | "ritorno";

const WALK_SPEED = 40;  // px/s del topo che cammina
const RUN_SPEED  = 80;  // px/s del topo in fuga

export class GattoTopoController {
  private state: State = "attesa";
  private timer = 0;

  constructor(
    private readonly gatto: Phaser.GameObjects.Sprite,
    private readonly topo: Phaser.GameObjects.Sprite,
    private readonly skinName: string,
    private readonly gattoX: number,
    private readonly topoStartX: number,
    private readonly topoEndX: number
  ) {
    this.playGatto("dorme");
    this.topo.setVisible(false).setFlipX(true); // guarda verso sinistra
    this.resetTimer();
  }

  private key(actorId: string, clip: string): string {
    return `bgactor:${this.skinName}:${actorId}:${clip}`;
  }

  private playGatto(clip: string): void { this.gatto.play(this.key("gatto", clip)); }
  private playTopo(clip: string):  void { this.topo.play(this.key("topo",  clip)); }

  private resetTimer(): void {
    this.timer = 6 + Math.random() * 6;
  }

  update(dt: number): void {
    switch (this.state) {
      case "attesa":
        this.timer -= dt;
        if (this.timer <= 0) {
          this.topo.setX(this.topoStartX).setVisible(true);
          this.playTopo("cammina");
          this.state = "arrivo";
        }
        break;

      case "arrivo":
        this.topo.x -= WALK_SPEED * dt;
        if (this.topo.x <= this.gattoX + 24) {
          this.playGatto("sveglia");
          this.state = "allarme";
        }
        break;

      case "allarme":
        // attende la fine di "sveglia" (repeat:0)
        if (!this.gatto.anims.isPlaying) {
          this.playGatto("zampata");
          this.state = "zampata";
        }
        break;

      case "zampata":
        // al termine della zampata il topo scatta
        if (!this.gatto.anims.isPlaying) {
          this.playTopo("corre");
          this.state = "fuga";
        }
        break;

      case "fuga":
        this.topo.x -= RUN_SPEED * dt;
        if (this.topo.x <= this.topoEndX) {
          this.topo.setVisible(false);
          this.playGatto("riaccuccia");
          this.state = "ritorno";
        }
        break;

      case "ritorno":
        // attende la fine di "riaccuccia", poi riparte
        if (!this.gatto.anims.isPlaying) {
          this.playGatto("dorme");
          this.resetTimer();
          this.state = "attesa";
        }
        break;
    }
  }
}
