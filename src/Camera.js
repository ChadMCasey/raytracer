export default class Camera {
    constructor(position) {
        this.viewportWidth = 1;
        this.viewportHeight = 1;
        this.viewportDistance = 1;
        this.position = position; // starting position.
    }
    canvasToViewportCoord(Cw, Ch, Cx, Cy) {
        const Vx = (this.viewportWidth / Cw) * Cx;
        const Vy = (this.viewportHeight / Ch) * Cy;
        const Vz = this.viewportDistance; // fixed viewport distance, for now.
        return [Vx, Vy, Vz];
    }
}
