import {Vector} from "./sylvester.src.js";

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
        this.temporaryTranslation = Vector.create([0, 0, 0]);
    }

    static intersect(origin, ray, cubeMin, cubeMax) {
        let tMin = cubeMin.subtract(origin).componentDivide(ray);
        let tMax = cubeMax.subtract(origin).componentDivide(ray);
        let t1 = Vector.min(tMin, tMax);
        let t2 = Vector.max(tMin, tMax);
        let tNear = t1.maxComponent();
        let tFar = t2.minComponent();
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
        this.minCorner = this.minCorner.add(vec);
        this.maxCorner = this.maxCorner.add(vec);
    }

    getMinCorner() {
        return this.minCorner.add(this.temporaryTranslation);
    }

    getMaxCorner() {
        return this.maxCorner.add(this.temporaryTranslation);
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
        this.temporaryTranslation = Vector.create([0, 0, 0]);
    }

    static intersect(origin, ray, center, radius) {
        var toSphere = origin.subtract(center);
        var a = ray.dot(ray);
        var b = 2 * toSphere.dot(ray);
        var c = toSphere.dot(toSphere) - radius * radius;
        var discriminant = b * b - 4 * a * c;
        if (discriminant > 0) {
            var t = (-b - Math.sqrt(discriminant)) / (2 * a);
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
        renderer.uniforms[this.centerStr] = this.center.add(this.temporaryTranslation);
        renderer.uniforms[this.radiusStr] = this.radius;
    };

    temporaryTranslate(translation) {
        this.temporaryTranslation = translation;
    };

    translate(translation) {
        this.center = this.center.add(translation);
    };

    getMinCorner() {
        return this.center.add(this.temporaryTranslation).subtract(Vector.create([this.radius, this.radius, this.radius]));
    };

    getMaxCorner() {
        return this.center.add(this.temporaryTranslation).add(Vector.create([this.radius, this.radius, this.radius]));
    };

    intersect(origin, ray) {
        return Sphere.intersect(origin, ray, this.center.add(this.temporaryTranslation), this.radius);
    };
}

let light = Vector.create([0.4, 0.5, -0.6]);
const lightSize = 0.1;

class Light extends SceneObject {
    constructor() {
        super();
        this.temporaryTranslation = Vector.create([0, 0, 0]);
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
        renderer.uniforms.light = light.add(this.temporaryTranslation);
    }

    temporaryTranslate(translation) {
        var tempLight = light.add(translation);
        Light.clampPosition(tempLight);
        this.temporaryTranslation = tempLight.subtract(light);
    }

    translate(translation) {
        light = light.add(translation);
        Light.clampPosition(light);
    };

    getMinCorner() {
        return light.add(this.temporaryTranslation).subtract(Vector.create([lightSize, lightSize, lightSize]));
    };

    getMaxCorner() {
        return light.add(this.temporaryTranslation).add(Vector.create([lightSize, lightSize, lightSize]));
    };

    intersect(origin, ray) {
        return Number.MAX_VALUE;
    };


    static clampPosition(position) {
        for (var i = 0; i < position.elements.length; i++) {
            position.elements[i] = Math.max(lightSize - 1, Math.min(1 - lightSize, position.elements[i]));
        }
    };
}

export {SceneObject, Cube, Sphere, Light};