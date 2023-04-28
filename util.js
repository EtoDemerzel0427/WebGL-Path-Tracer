import { Vector, Matrix } from './sylvester.src.js';
function getEyeRay(matrix, x, y, eye) {
  return matrix.multiply(Vector.create([x, y, 0, 1])).divideByW().ensure3().subtract(eye);
}

function setUniforms(gl, program, uniforms) {
  for(const name in uniforms) {
    const value = uniforms[name];
    const location = gl.getUniformLocation(program, name);
    if (location == null) continue;
    if(value instanceof Vector) {
      gl.uniform3fv(location, new Float32Array([value.elements[0], value.elements[1], value.elements[2]]));
    } else if(value instanceof Matrix) {
      gl.uniformMatrix4fv(location, false, new Float32Array(value.flatten()));
    } else {
      gl.uniform1f(location, value);
    }
  }
}

function concat(objects, func) {
  let text = '';
  for(let i = 0; i < objects.length; i++) {
    text += func(objects[i]);
  }
  return text;
}

function compileSource(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(source);
    throw 'compile error: ' + gl.getShaderInfoLog(shader);
  }
  return shader;
}

function compileShader(gl, vertexSource, fragmentSource) {
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, compileSource(gl, vertexSource, gl.VERTEX_SHADER));
  gl.attachShader(shaderProgram, compileSource(gl, fragmentSource, gl.FRAGMENT_SHADER));
  gl.linkProgram(shaderProgram);
  if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw 'link error: ' + gl.getProgramInfoLog(shaderProgram);
  }
  return shaderProgram;
}

export { getEyeRay, setUniforms, concat, compileShader};