import {Vec3, Mat4, Vec4} from './dist/TSM.js';

function getEyeRay(x, y, customMatrix, eye) {
  // this is the translated implementation
  //   const inv_model_view = customMatrix.inverse();
  let ndc = new Vec4([x, y, 0, 1]);

  let p = customMatrix.multiplyVec4(ndc);
  p = p.scale(1/p.w);

  let p_vec3 = new Vec3([p.x, p.y, p.z]);
  return p_vec3.subtract(eye);//.normalize();
}

function setUniforms(gl, program, uniforms) {
  for(const name in uniforms) {
    const value = uniforms[name];
    const location = gl.getUniformLocation(program, name);
    if (location == null) continue;
    if (value instanceof Vec3) {
        gl.uniform3fv(location, new Float32Array([value.x, value.y, value.z]));
    } else if (value instanceof Mat4) {
        gl.uniformMatrix4fv(location, false, new Float32Array(value.all()));
    }
    else {
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