/**
 * Primitive di disegno pixel-perfect su canvas 2D.
 * Tutto passa da qui: coordinate intere e nessun antialias, altrimenti il
 * look EGA si sporca al primo ingrandimento.
 */
export type Ctx = CanvasRenderingContext2D;

export function makeCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D non disponibile");
  ctx.imageSmoothingEnabled = false;
  return { canvas, ctx };
}

export function px(ctx: Ctx, x: number, y: number, col: string): void {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

export function rect(ctx: Ctx, x: number, y: number, w: number, h: number, col: string): void {
  ctx.fillStyle = col;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(0, Math.round(w)), Math.max(0, Math.round(h)));
}

/** Linea spessa via Bresenham: resta perfettamente aliasata a ogni angolo. */
export function line(
  ctx: Ctx, x0: number, y0: number, x1: number, y1: number, col: string, thickness = 1
): void {
  let ax = Math.round(x0), ay = Math.round(y0);
  const bx = Math.round(x1), by = Math.round(y1);
  const dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
  let err = dx - dy;
  const off = (thickness - 1) >> 1;
  ctx.fillStyle = col;
  for (;;) {
    ctx.fillRect(ax - off, ay - off, thickness, thickness);
    if (ax === bx && ay === by) break;
    const e2 = err * 2;
    if (e2 > -dy) { err -= dy; ax += sx; }
    if (e2 < dx) { err += dx; ay += sy; }
  }
}

/** Il canvas diventa un data URL: da qui in poi e' indistinguibile da un PNG. */
export function toDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}
