import {NumberTuple, NumberTriple, Sphere} from "./types.js";

class Controller {
  private viewportWidth: number = 1;
  private viewportHeight: number = 1;
  private viewportDistance: number = 1;
  private canvasW: number;
  private canvasH: number;
  private canvas: HTMLElement;
  private twoDContext: CanvasRenderingContext2D;
  private spheres: Sphere[];
  
  constructor(
    canvas: HTMLCanvasElement, 
    twoDcontext: CanvasRenderingContext2D, 
    spheres: Sphere[]) {
      this.canvas = canvas;
      this.canvasW = canvas?.width || -1; // -1 indicates error
      this.canvasH = canvas?.height || -1;
      this.twoDContext = twoDcontext
      this.spheres = spheres;
  }

  // x coordinate, y coordinate and color of the given pixel on the canvas
  putPixel(x: number, y:number, color: NumberTriple): void {
    this.twoDContext.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)`;
    this.twoDContext.fillRect(x, y, 1, 1);
  }

  // coodinate system conversion to 2D cartesian plane
  canvasCoordConversion(Cx: number, Cy: number): NumberTuple {
    const Sx: number = this.canvasW/2 + Cx;
    const Sy: number = this.canvasH/2 - Cy;
    return [Sx, Sy];
  } 

  canvasToViewportCoord(Cx: number, Cy: number): NumberTriple {
    const Vx: number = (this.viewportWidth / this.canvasW) * Cx;
    const Vy: number = (this.viewportHeight / this.canvasH ) * Cy;
    const Vz: number = this.viewportDistance; // fixed viewport distance, for now.
    return [Vx, Vy, Vz];
  }

  ScaleColorVector(R: number, G: number, B: number, kScale: number): NumberTriple {
    const clampedR = Math.max(Math.min(R  * kScale, 255),  0);
    const clampedG = Math.max(Math.min(G  * kScale, 255),  0);
    const clampedB = Math.max(Math.min(B  * kScale, 255),  0);

    return [clampedR, clampedG, clampedB];
  }

  // the ray equation
  computeRay(O: NumberTriple, V: NumberTriple, TScalar: number): NumberTriple {
    const diffX: number = V[0] - O[0];
    const diffY: number = V[1] - O[1];
    const diffZ: number = V[2] - O[2];
    const scaled: NumberTriple = [TScalar * diffX, TScalar * diffY, TScalar * diffZ];
    const point: NumberTriple = [O[0] + scaled[0], O[1] + scaled[1], O[2] + scaled[2]]
    return point; 
  }

  intersectRaySphere(O: NumberTriple, D: NumberTriple, sphere: Sphere): NumberTuple {
    const r: number = sphere.radius;
    const CO: NumberTriple = [O[0] - sphere.center[0], O[1] - sphere.center[1], O[2] - sphere.center[2]];

    const a: number = this.dotP(D, D);
    const b: number = 2 * this.dotP(CO, D);
    const c: number = this.dotP(CO, CO) - r*r;

    // at^2 +bt + c = 0 solution for t (ray intersection with sphere)
    const discriminantSquared: number = b**2 - 4*a*c;

    // discriminant < 0 then no intersection
    if (discriminantSquared < 0) 
      return [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    
    const discriminant: number = Math.sqrt(b**2 - 4*a*c);

    // single intersection case: ray tangent to sphere
    return [(-b + discriminant) / (2*a), (-b - discriminant) / (2*a)];
  }

  // distance from C to point P on sphere
  distFromCenter(C: NumberTriple, P: NumberTriple) {
    const diff: NumberTriple = [C[0] - P[0], C[1] - P[1], C[2] - P[2]];
    const rSquared: number = this.dotP(diff, diff);
    return rSquared;
  }

  // compute the intersection of the ray with every sphere and 
  // return the color of the sphere at the nearest intersection
  // inside of some requested range t.
  traceRay(O: NumberTriple, D: NumberTriple, minT: number, maxT: number) : NumberTriple
  {
    // create vars for closest t and sphere
    let closestT: number = Number.POSITIVE_INFINITY;
    let closestSphere: Sphere | null = null;

    // iterate shapes in 3D scene
    for (let i = 0; i < this.spheres.length; i++) {
      const sphere = this.spheres[i];

      // check if the ray running from the origin through the viewport
      // intersects some object within the scene. In this context its a sphere
      const [t1, t2]: NumberTuple = this.intersectRaySphere(O, D, sphere);    
      
      // check if t1 is inbounds and see if its our closest intersection
      if ((t1 >= minT && t1 <= maxT) && t1 < closestT) {
        closestT = t1;
        closestSphere = sphere;
      }
      
      // check if t2 is inbounds and see if its our closest intersection
      if ((t2 >= minT && t2 <= maxT) && t2 < closestT) {
        closestT = t2;
        closestSphere = sphere;
      } 
    }

    // no intersection > paint as the background color
    if (!closestSphere) {
      return [255,255,255]; // background color, we should set this as a constant.
    }

    return closestSphere.color;
  }

  dotP(a: NumberTriple, b: NumberTriple) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  render() {
    const canvasMinX = -this.canvasW/2;
    const canvasMaxX = this.canvasW/2;
    
    const canvasMinY = -this.canvasH/2;
    const canvasMaxY = this.canvasH/2;
    
    const O: NumberTriple = [0,0,0];
    
    // iterate the entire 2D cartesian plane of our canvas
    for (let x: number = canvasMinX; x <= canvasMaxX; x++) {
      for (let y: number = canvasMinY; y <= canvasMaxY; y++) {
        // scale our canvas coordinates based on viewport dimensions
        const D = this.canvasToViewportCoord(x, y);

        // some compuatation
        const color = this.traceRay(O, D, 1, Number.POSITIVE_INFINITY);

        const [putX, putY] = this.canvasCoordConversion(x,y);
        this.putPixel(putX, putY, color);
      }
    }    
  }
}



const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

const spheres: Sphere[] = [
  {
    center: [0, -1, 3],
    radius: 1,
    color: [255, 0, 0] // RED
  },
  {
    center: [2, 0, 4],
    radius: 1,
    color: [0, 0, 255] // BLUE
  },
  {
    center: [-2, 0, 4],
    radius: 1,
    color: [0, 255, 0] // GREEN
  }
];

//  instantiate controller
const control = new Controller(canvas, context, spheres);
document.addEventListener("click", () => control.render());
