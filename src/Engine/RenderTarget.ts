import { Vec2, Vec3 } from "../Configuration/types.js";
import { CANVAS_HEIGHT, ASPECT_RATIO } from "../Configuration/constants.js";

// The canvas is a render target in the context of the web
export default class RenderTarget {
  readonly canvas = document.getElementById("canvas") as HTMLCanvasElement;
  readonly context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

  readonly width: number;
  readonly height: number;

  constructor() {
    // determine camera dimensions based off browser window aspect ratio
    this.canvas.height = CANVAS_HEIGHT;
    this.canvas.width = Math.floor(ASPECT_RATIO() * CANVAS_HEIGHT);

    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  putPixel(x: number, y: number, color: Vec3): void {
    this.context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    this.context.fillRect(x, y, 1, 1);
  }

  // coodinate system conversion to 2D cartesian plane
  canvasCoordConversion(Cx: number, Cy: number): Vec2 {
    const Sx: number = this.width / 2 + Cx;
    const Sy: number = this.height / 2 - Cy;
    return [Sx, Sy];
  }
}
