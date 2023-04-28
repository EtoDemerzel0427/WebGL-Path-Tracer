import {compileShader, setUniforms} from './util.js';
import {lineVertexSource, lineFragmentSource} from './shader.js';
import {PathTracer} from "./tracer.js";
import {Matrix, Vector} from "./sylvester.src.js";

export class Renderer {
  constructor(gl) {
    this.gl = gl;
    const vertices = [
      0, 0, 0,
      1, 0, 0,
      0, 1, 0,
      1, 1, 0,
      0, 0, 1,
      1, 0, 1,
      0, 1, 1,
      1, 1, 1
    ];
    const indices = [
      0, 1, 1, 3, 3, 2, 2, 0,
      4, 5, 5, 7, 7, 6, 6, 4,
      0, 4, 1, 5, 2, 6, 3, 7
    ];

    // create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // create index buffer
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // create line shader
    this.lineProgram = compileShader(gl, lineVertexSource, lineFragmentSource);
    this.vertexAttribute = gl.getAttribLocation(this.lineProgram, 'vertex');
    gl.enableVertexAttribArray(this.vertexAttribute);

    this.objects = [];
    this.selectedObject = null;
    this.pathTracer = new PathTracer(gl);
  }

  setObjects(objects, material, environment) {
    this.objects = objects;
    this.selectedObject = null;
    this.pathTracer.setObjects(objects, material, environment);
  }

  update(modelviewProjection, timeSinceStart, eye, glossiness) {
    const jitter = Matrix.Translation(Vector.create([Math.random() * 2 - 1, Math.random() * 2 - 1, 0]).multiply(1 / 512));
    const inverse = jitter.multiply(modelviewProjection).inverse();
    this.modelviewProjection = modelviewProjection;
    this.pathTracer.update(inverse, timeSinceStart, eye, glossiness);
  }

  render() {
    const gl = this.gl;
    this.pathTracer.render();

    if (this.selectedObject != null) {
      gl.useProgram(this.lineProgram);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.enableVertexAttribArray(this.vertexAttribute);
      gl.vertexAttribPointer(this.vertexAttribute, 3, gl.FLOAT, false, 0, 0);
      setUniforms(gl, this.lineProgram, {
        cubeMin: this.selectedObject.getMinCorner(),
        cubeMax: this.selectedObject.getMaxCorner(),
        modelviewProjection: this.modelviewProjection
      });
      gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
    }
  }
}