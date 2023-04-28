import { Renderer } from './renderer.js';
import { Light } from './sceneObjects.js';
import { Cube, Sphere } from "./sceneObjects.js";
import { Vec3, Mat4 } from "./dist/TSM.js";
import {getEyeRay} from "./util.js";

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
    this.eye = eye

    this.modelview_ = Mat4.lookAt(eye, new Vec3([0, 0, 0]), new Vec3([0, 1, 0]));
    this.projection_ = Mat4.perspective(55, 1, 0.1, 100);
    this.modelviewProjection_ = this.projection_.multiply(this.modelview_);

    this.renderer.update(this.modelviewProjection_, timeSinceStart, eye, this.glossiness);
  }

  mouseDown(x, y) {
    let t;
    const origin = this.eye.copy();
    const ray = getEyeRay((x / 512) * 2 - 1, 1 - (y / 512) * 2, this.modelviewProjection_.copy().inverse(), this.eye);

    // test the selection box first
    if (this.renderer.selectedObject != null) {
      const minBounds = this.renderer.selectedObject.getMinCorner();
      const maxBounds = this.renderer.selectedObject.getMaxCorner();
      t = Cube.intersect(origin, ray, minBounds, maxBounds);

      if(t < Number.MAX_VALUE) {
        const hit = origin.copy().add(ray.copy().scale(t));

        if(Math.abs(hit.x - minBounds.x) < 0.001) this.movementNormal = new Vec3([-1, 0, 0]);
        else if(Math.abs(hit.x - maxBounds.x) < 0.001) this.movementNormal = new Vec3([+1, 0, 0]);
        else if(Math.abs(hit.y - minBounds.y) < 0.001) this.movementNormal = new Vec3([0, -1, 0]);
        else if(Math.abs(hit.y - maxBounds.z) < 0.001) this.movementNormal = new Vec3([0, +1, 0]);
        else if(Math.abs(hit.z - minBounds.z) < 0.001) this.movementNormal = new Vec3([0, 0, -1]);
        else this.movementNormal = new Vec3([0, 0, +1]);

        this.movementDistance = Vec3.dot(this.movementNormal, hit);

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
      const origin = this.eye.copy();
      const ray = getEyeRay((x / 512) * 2 - 1, 1 - (y / 512) * 2, this.modelviewProjection_.copy().inverse(), this.eye.copy());


      const t = (this.movementDistance - Vec3.dot(this.movementNormal, origin)) / Vec3.dot(this.movementNormal, ray);


      const hit = origin.add(ray.scale(t));
      const vec = hit.subtract(this.originalHit);

      this.renderer.selectedObject.temporaryTranslate(vec)

      this.renderer.pathTracer.sampleCount = 0;
    }
  }

  mouseUp(x, y) {
    if (this.moving) {
      const origin = this.eye.copy();
      const ray = getEyeRay((x / 512) * 2 - 1, 1 - (y / 512) * 2, this.modelviewProjection_.copy().inverse(), this.eye);

      const t = (this.movementDistance - Vec3.dot(this.movementNormal, origin)) / Vec3.dot(this.movementNormal, ray);
      const hit = origin.add(ray.scale(t));

      this.renderer.selectedObject.temporaryTranslate(new Vec3([0, 0, 0]));
      const vec = hit.subtract(this.originalHit);
      this.renderer.selectedObject.translate(vec);
      this.moving = false;
    }
  }

  render() {
    this.renderer.render();
  }

  selectLight() {
    this.renderer.selectedObject = this.objects[0];
  }

  addSphere() {
    const center = new Vec3([Math.random(), Math.random(), Math.random()]);
    this.objects.push(new Sphere(center, Math.random()));
    this.renderer.setObjects(this.objects, this.material, this.environment);
  }

  addCube() {
    const a = new Vec3([Math.random(), Math.random(), Math.random()]);
    const b = new Vec3([Math.random(), Math.random(), Math.random()]);

    const minCorner = new Vec3([Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z)]);
    const maxCorner = new Vec3([Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z)]);

    this.objects.push(new Cube(minCorner, maxCorner));
    this.renderer.setObjects(this.objects, this.material, this.environment);
  }

  deleteSelection() {
    for(let i = 0; i < this.objects.length; i++) {
      if(this.renderer.selectedObject === this.objects[i]) {
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


