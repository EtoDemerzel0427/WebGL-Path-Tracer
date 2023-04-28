// constants for the shaders
const bounces = '5';
const epsilon = '0.0001';
const infinity = '10000.0';
const lightSize = 0.1;
const lightVal = 0.5;

export const renderVertexSource = `
  attribute vec3 vertex;
  varying vec2 texCoord;
  void main() {
    texCoord = vertex.xy * 0.5 + 0.5;
    gl_Position = vec4(vertex, 1.0);
  }`;

export const renderFragmentSource = `
  precision highp float;
  varying vec2 texCoord;
  uniform sampler2D texture;
  void main() {
    gl_FragColor = texture2D(texture, texCoord);
  }`;


// vertex shader for drawing a line
export const lineVertexSource = `
attribute vec3 vertex;
uniform vec3 cubeMin;
uniform vec3 cubeMax;
uniform mat4 modelviewProjection;
void main() {
   gl_Position = modelviewProjection * vec4(mix(cubeMin, cubeMax, vertex), 1.0);
}
`;

export const lineFragmentSource = `
precision highp float;
void main() {
  gl_FragColor = vec4(1.0);
}
`;


export const tracerVertexSource = `
attribute vec3 vertex;
uniform vec3 eye, ray00, ray01, ray10, ray11;
varying vec3 initialRay;
void main() {
  vec2 percent = vertex.xy * 0.5 + 0.5;
  initialRay = mix(mix(ray00, ray01, percent.y), mix(ray10, ray11, percent.y), percent.x);
  gl_Position = vec4(vertex, 1.0);
}
`;

const tracerFragmentSourceHeader = `
precision highp float;
uniform vec3 eye;
varying vec3 initialRay;
uniform float textureWeight;
uniform float timeSinceStart;
uniform sampler2D texture;
uniform float glossiness;
vec3 roomCubeMin = vec3(-1.0, -1.0, -1.0);
vec3 roomCubeMax = vec3(1.0, 1.0, 1.0);
`;


const intersectCubeSource = `
vec2 intersectCube(vec3 origin, vec3 ray, vec3 cubeMin, vec3 cubeMax) {
  vec3 tMin = (cubeMin - origin) / ray;
  vec3 tMax = (cubeMax - origin) / ray;
  vec3 t1 = min(tMin, tMax);
  vec3 t2 = max(tMin, tMax);
  float tNear = max(max(t1.x, t1.y), t1.z);
  float tFar = min(min(t2.x, t2.y), t2.z);
  return vec2(tNear, tFar);
}
`;

const normalForCubeSource = `
vec3 normalForCube(vec3 hit, vec3 cubeMin, vec3 cubeMax) {
  if(hit.x < cubeMin.x + ${epsilon}) return vec3(-1.0, 0.0, 0.0);
  else if(hit.x > cubeMax.x - ${epsilon}) return vec3(1.0, 0.0, 0.0);
  else if(hit.y < cubeMin.y + ${epsilon}) return vec3(0.0, -1.0, 0.0);
  else if(hit.y > cubeMax.y - ${epsilon}) return vec3(0.0, 1.0, 0.0);
  else if(hit.z < cubeMin.z + ${epsilon}) return vec3(0.0, 0.0, -1.0);
  else return vec3(0.0, 0.0, 1.0);
}
`;


const intersectSphereSource = `
float intersectSphere(vec3 origin, vec3 ray, vec3 sphereCenter, float sphereRadius) {
  vec3 toSphere = origin - sphereCenter;
  float a = dot(ray, ray);
  float b = 2.0 * dot(toSphere, ray);
  float c = dot(toSphere, toSphere) - sphereRadius*sphereRadius;
  float discriminant = b*b - 4.0*a*c;
  if(discriminant > 0.0) {
    float t = (-b - sqrt(discriminant)) / (2.0 * a);
    if(t > 0.0) return t;
  }
  return ${infinity};
}
`;

const normalForSphereSource = `
vec3 normalForSphere(vec3 hit, vec3 sphereCenter, float sphereRadius) {
  return (hit - sphereCenter) / sphereRadius;
}
`;

const randomSource = `
highp float random(highp vec3 scale, float seed) {
    highp float d = 43758.5453;
    highp float dt = dot(gl_FragCoord.xyz + seed,scale);
    highp float sn = mod(dt,3.1415926);
   return fract(sin(sn) * d);
}
`;


// random cosine-weighted distributed vector
const cosineWeightedDirectionSource = `
vec3 cosineWeightedDirection(float seed, vec3 normal) {
  float u = random(vec3(12.9898, 78.233, 151.7182), seed);
  float v = random(vec3(63.7264, 10.873, 623.6736), seed);
  float r = sqrt(u);
  float angle = 6.283185307179586 * v;
  // compute basis from normal
  vec3 sdir, tdir;
  if (abs(normal.x) < .5) {
    sdir = cross(normal, vec3(1, 0, 0));
  } else {
    sdir = cross(normal, vec3(0, 1, 0));
  }
  tdir = cross(normal, sdir);
  return r * cos(angle) * sdir + r * sin(angle) * tdir + sqrt(1. - u) * normal;
}
`;

const uniformlyRandomDirectionSource = `
vec3 uniformlyRandomDirection(float seed) {
  float u = random(vec3(12.9898, 78.233, 151.7182), seed);
  float v = random(vec3(63.7264, 10.873, 623.6736), seed);
  float z = 1.0 - 2.0 * u;
  float r = sqrt(1.0 - z * z);
  float angle = 6.283185307179586 * v;
  return vec3(r * cos(angle), r * sin(angle), z);
}
`;

// random vector in the unit sphere
const uniformlyRandomVectorSource = `
vec3 uniformlyRandomVector(float seed) {
  return uniformlyRandomDirection(seed) * pow(random(vec3(36.7539, 50.3658, 306.2759), seed), 1.0 / 3.0);
}
`;

const specularReflection = `
vec3 reflectedLight = normalize(reflect(light - hit, normal));
specularHighlight = max(0.0, dot(reflectedLight, normalize(hit - origin)));
`;

const newDiffuseRay = `
ray = cosineWeightedDirection(timeSinceStart + float(bounce), normal);
`;

const newReflectiveRay = `
ray = reflect(ray, normal);
${specularReflection}
specularHighlight = 2.0 * pow(specularHighlight, 20.0);
`;

const newGlossyRay = `
ray = normalize(reflect(ray, normal)) + uniformlyRandomVector(timeSinceStart + float(bounce)) * glossiness;
${specularReflection}
specularHighlight = pow(specularHighlight, 3.0);
`;

const yellowBlueCornellBox = `
if (hit.x < -0.9999) surfaceColor = vec3(0.1, 0.5, 1.0); // blue
else if (hit.x > 0.9999) surfaceColor = vec3(1.0, 0.9, 0.1); // yellow
`;

const redGreenCornellBox = `
if (hit.x < -0.9999) surfaceColor = vec3(1.0, 0.3, 0.1); // red
else if (hit.x > 0.9999) surfaceColor = vec3(0.3, 1.0, 0.1); // green
`;


export const makeShadow = (objects) => `
float shadow(vec3 origin, vec3 ray) {
  ${objects.map((o) => o.getShadowTestCode()).join('\n')}
  return 1.0;
}`;


export const makeCalculateColor = (objects, material, environment) => `
  vec3 calculateColor(vec3 origin, vec3 ray, vec3 light) {
    vec3 colorMask = vec3(1.0);
    vec3 accumulatedColor = vec3(0.0);

    for(int bounce = 0; bounce < ${bounces}; bounce++) {
      vec2 tRoom = intersectCube(origin, ray, roomCubeMin, roomCubeMax);
      ${objects.map(o => o.getIntersectCode()).join("")}

      float t = ${infinity};
      if(tRoom.x < tRoom.y) t = tRoom.y;
      ${objects.map(o => o.getMinimumIntersectCode()).join("")}

      vec3 hit = origin + ray * t;
      vec3 surfaceColor = vec3(0.75);
      float specularHighlight = 0.0;
      vec3 normal;

      if(t == tRoom.y) {
        normal = -normalForCube(hit, roomCubeMin, roomCubeMax);
        ${[yellowBlueCornellBox, redGreenCornellBox][environment]}
        ${newDiffuseRay}
      } else if(t == ${infinity}) {
        break;
      } else {
        if(false) ;
        ${objects.map(o => o.getNormalCalculationCode()).join("")}
        ${[newDiffuseRay, newReflectiveRay, newGlossyRay][material]}
      }

      vec3 toLight = light - hit;
      float diffuse = max(0.0, dot(normalize(toLight), normal));

      float shadowIntensity = shadow(hit + normal * ${epsilon}, toLight);

      colorMask *= surfaceColor;
      accumulatedColor += colorMask * (${lightVal} * diffuse * shadowIntensity);
      accumulatedColor += colorMask * specularHighlight * shadowIntensity;

      origin = hit;
    }

    return accumulatedColor;
  }`;


export const mainShader = `
  void main() {
    vec3 newLight = light + uniformlyRandomVector(timeSinceStart - 53.0) * ${lightSize};
    vec3 texture = texture2D(texture, gl_FragCoord.xy / 512.0).rgb;
    gl_FragColor = vec4(mix(calculateColor(eye, initialRay, newLight), texture, textureWeight), 1.0);
  }`;


export function makeTracerFragmentSource(objects, material, environment) {
  return `
${tracerFragmentSourceHeader}
${objects.map(o => o.getGlobalCode()).join('\n')}
${intersectCubeSource}
${normalForCubeSource}
${intersectSphereSource}
${normalForSphereSource}
${randomSource}
${cosineWeightedDirectionSource}
${uniformlyRandomDirectionSource}
${uniformlyRandomVectorSource}
${makeShadow(objects)}
${makeCalculateColor(objects, material, environment)}
${mainShader}
  `;
}

export * from './shader.js';