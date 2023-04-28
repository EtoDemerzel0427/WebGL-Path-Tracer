import { Vec3 } from "./dist/TSM.js";

class SceneObject {
    getMinCorner() { }
    getMaxCorner() { }
    intersect(rayOrigin, rayDirection) { }
    temporaryTranslate(vec) { }
    translate(vec) { }
    getGlobalCode() { }
    getIntersectCode() { }
    getShadowTestCode() { }
    getMinimumIntersectCode() { }
    getNormalCalculationCode() { }
    setUniforms(pt) { }
}

class Cube extends SceneObject {
    static numCubes = 0;
    constructor(minCorner, maxCorner) {
        super();
        Cube.numCubes++;
        this.minCorner = minCorner;
        this.maxCorner = maxCorner;
        this.minStr = 'cubeMin' + Cube.numCubes;
        this.maxStr = 'cubeMax' + Cube.numCubes;
        this.intersectStr = 'tCube' + Cube.numCubes;
        this.temporaryTranslation = new Vec3([0, 0, 0]);
        //Vector.create([0, 0, 0]);
    }

    static intersect(origin, ray, cubeMin, cubeMax) {
        const tMin = cubeMin.copy().subtract(origin).divide(ray);
        const tMax = cubeMax.copy().subtract(origin).divide(ray);
        const t1 = new Vec3([Math.min(tMin.x, tMax.x), Math.min(tMin.y, tMax.y), Math.min(tMin.z, tMax.z)]);
        const t2 = new Vec3([Math.max(tMin.x, tMax.x), Math.max(tMin.y, tMax.y), Math.max(tMin.z, tMax.z)]);
        const tNear = Math.max(t1.x, t1.y, t1.z);
        const tFar = Math.min(t2.x, t2.y, t2.z);

        if (tNear > 0 && tNear < tFar) {
            return tNear;
        }
        return Number.MAX_VALUE;
    }

    getGlobalCode() {
        return `
uniform vec3 ${this.minStr};
uniform vec3 ${this.maxStr};`;
    }

    getIntersectCode() {
        return `
    vec2 ${this.intersectStr} = intersectCube(origin, ray, ${this.minStr}, ${this.maxStr});
            `
    }

    getShadowTestCode() {
        return this.getIntersectCode() + `
    if (${this.intersectStr}.x > 0.0 && ${this.intersectStr}.x < 1.0 && ${this.intersectStr}.x < ${this.intersectStr}.y) {
        return 0.0;
    }
        `;
    }

    getMinimumIntersectCode() {
        return `if (${this.intersectStr}.x > 0.0 && ${this.intersectStr}.x < ${this.intersectStr}.y && ${this.intersectStr}.x < t) {
                t = ${this.intersectStr}.x;
            }
        `;

    }

    getNormalCalculationCode() {
        return `else if (t == ${this.intersectStr}.x && ${this.intersectStr}.x < ${this.intersectStr}.y) {
                normal = normalForCube(hit, ${this.minStr}, ${this.maxStr});
            }
        `;
    }

    setUniforms(renderer) {
        renderer.uniforms[this.minStr] = this.getMinCorner();
        renderer.uniforms[this.maxStr] = this.getMaxCorner();
    }

    temporaryTranslate(translation) {
        this.temporaryTranslation = translation;
    }

    translate(vec) {
        this.minCorner.add(vec);
        this.maxCorner.add(vec);
    }

    getMinCorner() {
        return this.minCorner.copy().add(this.temporaryTranslation);
    }


    getMaxCorner() {
        return this.maxCorner.copy().add(this.temporaryTranslation);
    }

    intersect(origin, ray) {
        return Cube.intersect(origin, ray, this.getMinCorner(), this.getMaxCorner());
    }
}

class Sphere extends SceneObject {
    static numSpheres = 0;
    constructor(center, radius) {
        super();
        Sphere.numSpheres++;
        this.center = center;
        this.radius = radius;
        this.centerStr = 'sphereCenter' + Sphere.numSpheres;
        this.radiusStr = 'sphereRadius' + Sphere.numSpheres;
        this.intersectStr = 'tSphere' + Sphere.numSpheres;
        this.temporaryTranslation = new Vec3([0, 0, 0]);
        //Vector.create([0, 0, 0]);
    }

    static intersect(origin, ray, center, radius) {
        const toSphere = origin.copy().subtract(center);
        const a = Vec3.dot(ray, ray);
        const b = 2 * Vec3.dot(toSphere, ray);
        const c = Vec3.dot(toSphere, toSphere) - radius * radius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant > 0) {
            const t = (-b - Math.sqrt(discriminant)) / (2 * a);
            if (t > 0) {
                return t;
            }
        }
        return Number.MAX_VALUE;
    };

    getGlobalCode() {
        return `
uniform vec3 ${this.centerStr};
uniform float ${this.radiusStr};
        `;
    }

    getIntersectCode() {
        return `    float ${this.intersectStr} = intersectSphere(origin, ray, ${this.centerStr}, ${this.radiusStr});
        `;
    }

    getShadowTestCode() {
        return this.getIntersectCode() + `
    if (${this.intersectStr} < 1.0) {
        return 0.0;
    }
    `;
    }

    getMinimumIntersectCode() {
        return `
    if (${this.intersectStr} < t) {
        t = ${this.intersectStr};
    }
    `;
    }

    getNormalCalculationCode() {
        return `else if (t == ${this.intersectStr}) {
            normal = normalForSphere(hit, ${this.centerStr}, ${this.radiusStr});
        }
        `;
    }

    setUniforms(renderer) {
        renderer.uniforms[this.centerStr] = this.center.copy().add(this.temporaryTranslation);
        renderer.uniforms[this.radiusStr] = this.radius;
    };

    temporaryTranslate(translation) {
        this.temporaryTranslation = translation;
    };

    translate(translation) {
        this.center.add(translation);
    };

    getMinCorner() {
        return this.center.copy().add(this.temporaryTranslation).subtract(new Vec3([this.radius, this.radius, this.radius]));
    };

    getMaxCorner() {
        return this.center.copy().add(this.temporaryTranslation).add(new Vec3([this.radius, this.radius, this.radius]));
    };

    intersect(origin, ray) {
        return Sphere.intersect(origin, ray, this.center.copy().add(this.temporaryTranslation), this.radius);
    };
}

let light = new Vec3([0.4, 0.5, -0.6]);
const lightSize = 0.1;

class Light extends SceneObject {
    constructor() {
        super();
        this.temporaryTranslation = new Vec3([0, 0, 0]);
    }

    getGlobalCode() {
        return 'uniform vec3 light;';
    };

    getIntersectCode() {
        return '';
    }

    getShadowTestCode() {
        return '';
    }

    getMinimumIntersectCode() {
        return '';
    }

    getNormalCalculationCode() {
        return '';
    }

    setUniforms(renderer) {
        renderer.uniforms.light = light.copy().add(this.temporaryTranslation);
    }

    temporaryTranslate(translation) {
        let tempLight = light.copy().add(translation);
        Light.clampPosition(tempLight);
        this.temporaryTranslation = tempLight.subtract(light);
    }

    translate(translation) {
        light.add(translation);
        Light.clampPosition(light);
    };

    getMinCorner() {
        // return light.add(this.temporaryTranslation).subtract(Vector.create([lightSize, lightSize, lightSize]));
        return light.copy().add(this.temporaryTranslation).subtract(new Vec3([lightSize, lightSize, lightSize]));
    };

    getMaxCorner() {
        // return light.add(this.temporaryTranslation).add(Vector.create([lightSize, lightSize, lightSize]));
        return light.copy().add(this.temporaryTranslation).add(new Vec3([lightSize, lightSize, lightSize]));
    };

    intersect(origin, ray) {
        return Number.MAX_VALUE;
    };


    static clampPosition(position) {
        for (let i = 0; i < 3; i++) {
            position[i] = Math.max(lightSize - 1, Math.min(1 - lightSize, position.at(i)));
        }
    };
}

export {SceneObject, Cube, Sphere, Light};