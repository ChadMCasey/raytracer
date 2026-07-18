import { Vec3 } from "./types.js";

// Canvas
const CANVAS_WIDTH: number = 1080;
const CANVAS_HEIGHT: number = 1080;
const CANVAS_DEFAULT_BACKGROUND: Vec3 = [255, 255, 255];

// Camera
const CAMERA_POS: Vec3 = [0, 0, 0];

// Minimal T for shadow determination
const MIN_T_FOR_SHADOW = 0.001;

export {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_DEFAULT_BACKGROUND,
  CAMERA_POS,
  MIN_T_FOR_SHADOW,
};
