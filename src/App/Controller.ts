import Camera from "../Engine/Camera.js";
import {
  VALID_MOVEMENT_KEYS,
  CAMERA_MOVEMENT_SPEED,
} from "../Configuration/constants.js";
import { Vec2 } from "../Configuration/types.js";
import MathUtils from "../Utils/MathUtils.js";

// read user input and update application
export default class Controller {
  private readonly mathUtils = new MathUtils();

  // camera movement
  public readonly keyPressedSet = new Set<string>();
  private readonly validMovementKeySet = new Set(VALID_MOVEMENT_KEYS);

  // camera orientation
  private readonly rotationDeltas: Vec2 = [0, 0];

  public readonly camera: Camera;

  constructor(camera: Camera) {
    this.camera = camera;

    // hookup event listeners
    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (this.validMovementKeySet.has(e.key)) this.keyPressedSet.add(e.key);
    });
    document.addEventListener("keyup", (e) => {
      if (this.validMovementKeySet.has(e.key)) this.keyPressedSet.delete(e.key);
    });
    document.addEventListener("pointerlockchange", (lockEvent) => {});
  }

  update(elapsedMs: number) {
    this.updateCameraPosition(elapsedMs);
    this.updateCameraOrientation();
  }

  updateCameraPosition(elapsedMs: number) {
    let changeX: number = 0;
    let changeZ: number = 0;

    // accumulate change in position
    changeX += this.keyPressedSet.has("a") ? -1 : 0;
    changeX += this.keyPressedSet.has("d") ? 1 : 0;
    changeZ += this.keyPressedSet.has("s") ? -1 : 0;
    changeZ += this.keyPressedSet.has("w") ? 1 : 0;

    // compute magnitude of vector for change in camera position
    let movementVector: Vec2 = [changeX, changeZ];
    const movementMagnitude: number =
      this.mathUtils.magnitudeV2(movementVector);

    // the user is not moving at all
    if (movementMagnitude === 0) return;

    // create directional vector with magnitude 1
    movementVector = this.mathUtils.scaleVectorV2(
      movementVector,
      1 / movementMagnitude,
    );

    // normalize change in position based on time since last frame
    const Dx = (elapsedMs / 1000) * movementVector[0] * CAMERA_MOVEMENT_SPEED;
    const Dz = (elapsedMs / 1000) * movementVector[1] * CAMERA_MOVEMENT_SPEED;

    this.camera.updateCameraX(Dx);
    this.camera.updateCameraZ(Dz);
  }

  updateCameraOrientation() {}
}
