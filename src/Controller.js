import MathUtils from "./MathUtils";
import { CANVAS_DEFAULT_BACKGROUND, CAMERA_POS } from "./constants";
import Sphere from "./Sphere";
class Controller {
    constructor(canvas, twoDcontext, sceneObjs) {
        this.viewportWidth = 1;
        this.viewportHeight = 1;
        this.viewportDistance = 1;
        this.mathUtils = new MathUtils();
        this.canvas = canvas;
        this.canvasW = canvas?.width || -1; // -1 indicates error
        this.canvasH = canvas?.height || -1;
        this.twoDContext = twoDcontext;
        this.sceneObjs = sceneObjs;
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
    canvasToViewportCoord(Cx, Cy) {
        const Vx = (this.viewportWidth / this.canvasW) * Cx;
        const Vy = (this.viewportHeight / this.canvasH) * Cy;
        const Vz = this.viewportDistance; // fixed viewport distance, for now.
        return [Vx, Vy, Vz];
    }
    ScaleColorVector(R, G, B, kScale) {
        const clampedR = Math.max(Math.min(R * kScale, 255), 0);
        const clampedG = Math.max(Math.min(G * kScale, 255), 0);
        const clampedB = Math.max(Math.min(B * kScale, 255), 0);
        return [clampedR, clampedG, clampedB];
    }
    // the ray equation
    computeRay(O, V, TScalar) {
        const D = this.mathUtils.subtractVectors(V, O);
        const Dscaled = this.mathUtils.scaleVector(D, TScalar);
        const ray = this.mathUtils.addVectors(O, Dscaled);
        return ray;
    }
    // distance from C to point P on sphere
    distFromCenter(C, P) {
        const CMinusP = this.mathUtils.subtractVectors(C, P);
        const rSquared = this.mathUtils.dotVectors(CMinusP, CMinusP);
        return rSquared;
    }
    // compute the intersection of the ray with every sphere and 
    // return the color of the sphere at the nearest intersection
    // inside of some requested range t.
    traceRay(O, D, minT, maxT) {
        let closestIntersection = Number.POSITIVE_INFINITY;
        let closestObj = null;
        for (let i = 0; i < this.sceneObjs.length; i++) {
            const sceneObj = this.sceneObjs[i];
            const intersection = sceneObj.intersect(O, D);
            if (!intersection)
                continue;
            const distance = intersection.distance;
            if ((distance >= minT && distance <= maxT) && distance < closestIntersection) {
                closestIntersection = distance;
                closestObj = sceneObj;
            }
        }
        if (!closestObj) {
            return CANVAS_DEFAULT_BACKGROUND;
        }
        return closestObj.color;
    }
    render() {
        const canvasMinX = -this.canvasW / 2;
        const canvasMaxX = this.canvasW / 2;
        const canvasMinY = -this.canvasH / 2;
        const canvasMaxY = this.canvasH / 2;
        const O = CAMERA_POS;
        for (let x = canvasMinX; x <= canvasMaxX; x++) {
            for (let y = canvasMinY; y <= canvasMaxY; y++) {
                const D = this.canvasToViewportCoord(x, y);
                const color = this.traceRay(O, D, 1, Number.POSITIVE_INFINITY);
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
//  instantiate controller
const control = new Controller(canvas, context, sceneObjs);
document.addEventListener("click", () => control.render());
