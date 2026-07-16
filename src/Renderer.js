import { CAMERA_POS } from "./constants.js";
import Scene from "./Scene.js";
import Sphere from "./Sphere.js";
import Camera from "./Camera.js";
class Controller {
    constructor(canvas, twoDcontext, scene, camera) {
        this.canvasW = canvas?.width; // -1 indicates error
        this.canvasH = canvas?.height;
        this.twoDContext = twoDcontext;
        this.scene = scene;
        this.camera = camera;
    }
    // x coordinate, y coordinate and color of the given pixel on the canvas
    putPixel(x, y, color) {
        this.twoDContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
        this.twoDContext.fillRect(x, y, 1, 1);
    }
    // coodinate system conversion to 2D cartesian plane
    canvasCoordConversion(Cx, Cy) {
        const Sx = this.canvasW / 2 + Cx;
        const Sy = this.canvasH / 2 - Cy;
        return [Sx, Sy];
    }
    render() {
        const cameraPos = this.camera.position;
        for (let x = -this.canvasW / 2; x <= this.canvasW / 2; x++) {
            for (let y = -this.canvasH / 2; y <= this.canvasH / 2; y++) {
                const D = this.camera.canvasToViewportCoord(this.canvasW, this.canvasH, x, y);
                const color = this.scene.traceRay(cameraPos, D, 1, Number.POSITIVE_INFINITY);
                const [putX, putY] = this.canvasCoordConversion(x, y);
                this.putPixel(putX, putY, color);
            }
        }
    }
}
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const sceneObjs = [
    new Sphere([0, -1, 3], 1, [255, 0, 0]),
    new Sphere([2, 0, 4], 1, [0, 0, 255]),
    new Sphere([-2, 0, 4], 1, [0, 255, 0])
];
const scene = new Scene(sceneObjs);
const camera = new Camera(CAMERA_POS);
const control = new Controller(canvas, context, scene, camera);
document.addEventListener("click", () => control.render());
