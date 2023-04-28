import { compileShader, setUniforms } from './util.js';
import {
  renderVertexSource,
  renderFragmentSource,
  tracerVertexSource,
  makeTracerFragmentSource
} from "./shader.js";
import { getEyeRay} from "./util.js";

export class PathTracer {
  constructor(gl) {
    this.gl = gl;
    const vertices = [
      -1, -1,
      -1, +1,
      +1, -1,
      +1, +1
    ];

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    this.framebuffer = gl.createFramebuffer();

    const type = gl.getExtension('OES_texture_float') ? gl.FLOAT : gl.UNSIGNED_BYTE;
    this.textures = [];
    for (let i = 0; i < 2; i++) {
      this.textures.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, type, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.renderProgram = compileShader(gl, renderVertexSource, renderFragmentSource);
    this.renderVertexAttribute = gl.getAttribLocation(this.renderProgram, 'vertex');
    gl.enableVertexAttribArray(this.renderVertexAttribute);

    this.objects = [];
    this.sampleCount = 0;
    this.tracerProgram = null;
  }

  setObjects(objects, material, environment) {
    this.uniforms = {};
    this.sampleCount = 0;
    this.objects = objects;

    if (this.tracerProgram != null) {
      this.gl.deleteProgram(this.tracerProgram);
    }

    this.tracerProgram = compileShader(this.gl, tracerVertexSource, makeTracerFragmentSource(objects, material, environment));
    this.tracerVertexAttribute = this.gl.getAttribLocation(this.tracerProgram, 'vertex');
    this.gl.enableVertexAttribArray(this.tracerVertexAttribute);
  }

  update(matrix, timeSinceStart, eye, glossiness) {
    const gl = this.gl;
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].setUniforms(this);
    }
    this.uniforms.eye = eye;
    this.uniforms.glossiness = glossiness;
    this.uniforms.ray00 = getEyeRay(-1, -1, matrix, eye);
    this.uniforms.ray01 = getEyeRay(-1, +1, matrix, eye);
    this.uniforms.ray10 = getEyeRay(+1, -1, matrix, eye);
    this.uniforms.ray11 = getEyeRay(+1, +1, matrix, eye);
    this.uniforms.timeSinceStart = timeSinceStart;
    this.uniforms.textureWeight = this.sampleCount / (this.sampleCount + 1);

    gl.useProgram(this.tracerProgram);
    setUniforms(gl, this.tracerProgram, this.uniforms);

    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textures[1], 0);
    gl.vertexAttribPointer(this.tracerVertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // ping pong textures
    this.textures.reverse();
    this.sampleCount++;
  }

  render() {
    const gl = this.gl;
    gl.useProgram(this.renderProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(this.renderVertexAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}