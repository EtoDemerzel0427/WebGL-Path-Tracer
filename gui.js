import { Renderer } from './renderer.js';
import { Light } from './sceneObjects.js';
import { makeLookAt } from './glUtils.js';
import { makePerspective } from './glUtils.js';
import { getEyeRay} from "./util.js";
import { Cube, Sphere } from "./sceneObjects.js";
import { Vector} from "./sylvester.src.js";

const MATERIAL_GLOSSY = 2;
export class UI {
  constructor(gl, eye, material, environment, glossiness) {
    this.renderer = new Renderer(gl);
    this.eye = eye;
    this.moving = false;
    this.material = material;
    this.environment = environment;
    this.glossiness = glossiness;
    this.initEventListeners();
  }

  setObjects(objects) {
    this.objects = objects;
    this.objects.splice(0, 0, new Light());
    this.renderer.setObjects(this.objects, this.material, this.environment);
  }

  update(eye, timeSinceStart) {
    this.eye = eye;
    this.modelview = makeLookAt(eye.elements[0], eye.elements[1], eye.elements[2], 0, 0, 0, 0, 1, 0);
    this.projection = makePerspective(55, 1, 0.1, 100);
    this.modelviewProjection = this.projection.multiply(this.modelview);
    this.renderer.update(this.modelviewProjection, timeSinceStart, eye, this.glossiness);
  }

  mouseDown(x, y) {
    let t;
    const origin = this.eye;
    const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2, this.eye);

    // test the selection box first
    if (this.renderer.selectedObject != null) {
      var minBounds = this.renderer.selectedObject.getMinCorner();
      var maxBounds = this.renderer.selectedObject.getMaxCorner();
      t = Cube.intersect(origin, ray, minBounds, maxBounds);

      if(t < Number.MAX_VALUE) {
        var hit = origin.add(ray.multiply(t));

        if(Math.abs(hit.elements[0] - minBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([-1, 0, 0]);
        else if(Math.abs(hit.elements[0] - maxBounds.elements[0]) < 0.001) this.movementNormal = Vector.create([+1, 0, 0]);
        else if(Math.abs(hit.elements[1] - minBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, -1, 0]);
        else if(Math.abs(hit.elements[1] - maxBounds.elements[1]) < 0.001) this.movementNormal = Vector.create([0, +1, 0]);
        else if(Math.abs(hit.elements[2] - minBounds.elements[2]) < 0.001) this.movementNormal = Vector.create([0, 0, -1]);
        else this.movementNormal = Vector.create([0, 0, +1]);

        this.movementDistance = this.movementNormal.dot(hit);
        this.originalHit = hit;
        this.moving = true;

        return true;
      }
    }

    t = Number.MAX_VALUE;
    this.renderer.selectedObject = null;

    for(let i = 0; i < this.objects.length; i++) {
      const objectT = this.objects[i].intersect(origin, ray);
      if(objectT < t) {
        t = objectT;
        this.renderer.selectedObject = this.objects[i];
      }
    }

    return (t < Number.MAX_VALUE);
  }

  mouseMove(x, y) {
    if (this.moving) {
      const origin = this.eye;
      const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2, this.eye);

      const t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
      const hit = origin.add(ray.multiply(t));
      this.renderer.selectedObject.temporaryTranslate(hit.subtract(this.originalHit));

      this.renderer.pathTracer.sampleCount = 0;
    }
  }

  mouseUp(x, y) {
    if (this.moving) {
      const origin = this.eye;
      const ray = getEyeRay(this.modelviewProjection.inverse(), (x / 512) * 2 - 1, 1 - (y / 512) * 2, this.eye);

      const t = (this.movementDistance - this.movementNormal.dot(origin)) / this.movementNormal.dot(ray);
      const hit = origin.add(ray.multiply(t));
      this.renderer.selectedObject.temporaryTranslate(Vector.create([0, 0, 0]));
      this.renderer.selectedObject.translate(hit.subtract(this.originalHit));
      this.moving = false;
    }
  }

  render() {
    this.renderer.render();
  }

  selectLight() {
    console.log('selectLight');
    this.renderer.selectedObject = this.objects[0];
  }

  addSphere() {
    this.objects.push(new Sphere(Vector.Random(3), Math.random()));
    this.renderer.setObjects(this.objects, this.material, this.environment);
  }

  addCube() {
    let minCorner = Vector.Random(3);
    let maxCorner = Vector.Random(3);
    this.objects.push(new Cube(minCorner, maxCorner));
    this.renderer.setObjects(this.objects, this.material, this.environment);
  }

  deleteSelection() {
    for(let i = 0; i < this.objects.length; i++) {
      if(this.renderer.selectedObject == this.objects[i]) {
        this.objects.splice(i, 1);
        this.renderer.selectedObject = null;
        this.renderer.setObjects(this.objects, this.material, this.environment);
        break;
      }
    }
  }

  updateMaterial() {
    const newMaterial = parseInt(document.getElementById('material').value, 10);
    if(this.material !== newMaterial) {
      this.material = newMaterial;
      this.renderer.setObjects(this.objects, this.material, this.environment);
    }
  }

  updateEnvironment() {
    const newEnvironment = parseInt(document.getElementById('environment').value, 10);
    if(this.environment !== newEnvironment) {
      this.environment = newEnvironment;
      this.renderer.setObjects(this.objects, this.material, this.environment);
    }
  }

  updateGlossiness() {
    let newGlossiness = parseFloat(document.getElementById('glossiness').value);
    if (isNaN(newGlossiness))
      newGlossiness = 0;

    newGlossiness = Math.max(0, Math.min(1, newGlossiness));
    if(this.material === MATERIAL_GLOSSY && this.glossiness !== newGlossiness) {
      this.renderer.pathTracer.sampleCount = 0;
    }
    this.glossiness = newGlossiness;
  }

  initEventListeners() {
    document.querySelector('.light-button').addEventListener('click', () => {
        this.selectLight();
      });

      document.querySelector('.add-sphere-button').addEventListener('click', () => {
        this.addSphere();
      });

      document.querySelector('.add-cube-button').addEventListener('click', () => {
        this.addCube();
      });

  }
}


