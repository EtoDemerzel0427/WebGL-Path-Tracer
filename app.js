import { UI } from './gui.js';
import { Cube, Sphere } from "./sceneObjects.js";
import { Vec3 } from "./dist/TSM.js";

let gl = null;
let ui;
let error;
let canvas;
let inputFocusCount = 0;

let angleX = 0;
let angleY = 0;
const zoomZ = 2.5;
let eye = new Vec3([0, 0, 2.5]);

const MATERIAL_DIFFUSE = 0;
// const MATERIAL_MIRROR = 1;
const MATERIAL_GLOSSY = 2;
let material = MATERIAL_DIFFUSE;
let glossiness = 0.6;

const YELLOW_BLUE_CORNELL_BOX = 0;
// const RED_GREEN_CORNELL_BOX = 1;
let environment = YELLOW_BLUE_CORNELL_BOX;

function tick(timeSinceStart) {
  eye.x = zoomZ * Math.sin(angleY) * Math.cos(angleX);
  eye.y = zoomZ * Math.sin(angleX);
  eye.z = zoomZ * Math.cos(angleY) * Math.cos(angleX);


  document.getElementById('glossiness-factor').style.display = (ui.material === MATERIAL_GLOSSY) ? 'inline' : 'none';

  ui.updateMaterial();
  ui.updateGlossiness();
  ui.updateEnvironment();
  ui.update(eye, timeSinceStart);
  ui.render();
}

function makeStudy() {
  const objects = [];

  // table-top
  objects.push(new Cube(new Vec3([-0.5, -0.3, -0.8]), new Vec3([0.3, -0.35, 0.8])));

  // table legs
  objects.push(new Cube(new Vec3([-0.45, -1, -0.7]), new Vec3([-0.4, -0.352, 0.7])));
  objects.push(new Cube(new Vec3([-0.45, -1, -0.75]), new Vec3([0.2, -0.352, -0.7])));
  objects.push(new Cube(new Vec3([-0.45, -1, 0.75]), new Vec3([0.2, -0.352, 0.7])));

  objects.push(new Cube(new Vec3([-0.45, -1, 0.35]), new Vec3([0.2, -0.352, 0.3])));

  // shelf
  objects.push(new Cube(new Vec3([-0.45, -0.6, 0.7]), new Vec3([0.2, -0.55, 0.35])));
  objects.push(new Cube(new Vec3([-0.45, -0.8, 0.7]), new Vec3([0.2, -0.75, 0.35])));
  objects.push(new Cube(new Vec3([-0.45, -1, 0.7]), new Vec3([0.2, -0.95, 0.35])));

  // drawer
  objects.push(new Cube(new Vec3([0.18, -0.36, 0.69]), new Vec3([0.22, -0.54, 0.36])));
  objects.push(new Cube(new Vec3([0.18, -0.56, 0.69]), new Vec3([0.22, -0.74, 0.36])));
  objects.push(new Cube(new Vec3([0.18, -0.76, 0.69]), new Vec3([0.22, -0.94, 0.36])));

  // display on the table
  objects.push(new Cube(new Vec3([-0.4, -0.28, 0.3]), new Vec3([-0.2, -0.3, 0.1])));
  objects.push(new Cube(new Vec3([-0.32, -0.28, 0.23]), new Vec3([-0.28, 0, 0.18])));
  objects.push(new Cube(new Vec3([-0.28, -0.02, 0.225]), new Vec3([-0.21, -0.07, 0.175])));

  objects.push(new Cube(new Vec3([-0.22, -0.2, 0.5]), new Vec3([-0.18, 0.2, -0.1])));

  // audio
  objects.push(new Cube(new Vec3([-0.25, -0.1, -0.3]), new Vec3([-0.1, -0.3, -0.15])));
  objects.push(new Cube(new Vec3([-0.25, -0.1, 0.7]), new Vec3([-0.1, -0.3, 0.55])));

  // chair seat
  objects.push(new Cube(new Vec3([0.3, -0.6, -0.2]), new Vec3([0.7, -0.55, 0.2])));

  // chair legs
  objects.push(new Cube(new Vec3([0.3, -1, -0.2]), new Vec3([0.35, -0.6, -0.15])));
  objects.push(new Cube(new Vec3([0.3, -1, 0.15]), new Vec3([0.35, -0.6, 0.2])));
  objects.push(new Cube(new Vec3([0.65, -1, -0.2]), new Vec3([0.7, 0.1, -0.15])));
  objects.push(new Cube(new Vec3([0.65, -1, 0.15]), new Vec3([0.7, 0.1, 0.2])));

  // chair back
  objects.push(new Cube(new Vec3([0.65, 0.05, -0.15]), new Vec3([0.7, 0.1, 0.15])));
  objects.push(new Cube(new Vec3([0.65, -0.55, -0.09]), new Vec3([0.7, 0.1, -0.03])));
  objects.push(new Cube(new Vec3([0.65, -0.55, 0.03]), new Vec3([0.7, 0.1, 0.09])));

  // sphere on the wall
  objects.push(new Sphere(new Vec3([-0.1, 0.6, -1.1]), 0.25 ));

  return objects;
}



function makeLivingRoom() {
  const objects = [];

  // lower level
  // table-top
  objects.push(new Cube(new Vec3([-0.8, -0.65, 0]), new Vec3([-0.35, -0.6, 0.7])));
  objects.push(new Cube(new Vec3([-0.8, -0.8, 0]), new Vec3([-0.35, -0.75, 0.7])));

  // table legs
  objects.push(new Cube(new Vec3([-0.75, -1, 0.05]), new Vec3([-0.7, -0.65, 0.1])));
  objects.push(new Cube(new Vec3([-0.5, -1, 0.05]), new Vec3([-0.45, -0.65, 0.1])));
  objects.push(new Cube(new Vec3([-0.75, -1, 0.6]), new Vec3([-0.7, -0.65, 0.65])));
  objects.push(new Cube(new Vec3([-0.5, -1, 0.6]), new Vec3([-0.45, -0.65, 0.65])));

  // TV back
  objects.push(new Cube(new Vec3([-1.0, 0, -0.1]), new Vec3([-0.95, -0.1, 0.1])));
  objects.push(new Cube(new Vec3([-0.96, 0.3, -0.65]), new Vec3([-0.95, -0.4, 0.65])));

  // Sofa
  objects.push(new Cube(new Vec3([-0.4, -0.81, -0.3]), new Vec3([0.9, -0.6, -0.9])));
  objects.push(new Cube(new Vec3([0.2, -0.81, 0.9]), new Vec3([0.9, -0.6, -0.4])));

  objects.push(new Cube(new Vec3([-0.36, -0.9, -0.3]), new Vec3([0.9, -0.8, -0.9])));
  objects.push(new Cube(new Vec3([0.24, -0.9, 0.86]), new Vec3([0.9, -0.8, -0.4])));

  objects.push(new Cube(new Vec3([-0.3, -0.45, -0.86]), new Vec3([0.95, -0.7, -0.95])));
  objects.push(new Cube(new Vec3([0.85, -0.35, 0.85]), new Vec3([0.95, -0.7, -0.85])));
  objects.push(new Cube(new Vec3([0.3, -0.45, 0.86]), new Vec3([0.95, -0.7, 0.95])));

  // sofa legs
  objects.push(new Cube(new Vec3([-0.3, -1, -0.4]), new Vec3([-0.35, -0.9, -0.45])));
  objects.push(new Cube(new Vec3([-0.3, -1, -0.8]), new Vec3([-0.35, -0.9, -0.75])));
  objects.push(new Cube(new Vec3([0.25, -1, 0.8]), new Vec3([0.3, -0.9, 0.75])));
  objects.push(new Cube(new Vec3([0.85, -1, 0.8]), new Vec3([0.9, -0.9, 0.75])));

  return objects;
}




function makeEmpty() {
  return [];
}


window.onload = function() {
  gl = null;
  error = document.getElementById('error');
  canvas = document.getElementById('canvas');
  try { gl = canvas.getContext('webgl2'); } catch(e) {}

  if(gl) {
    error.innerHTML = 'Loading...';

    // keep track of whether an <input> is focused or not (will be no only if inputFocusCount == 0)
    const inputs = document.getElementsByTagName('input');
    for(let i= 0; i < inputs.length; i++) {
      inputs[i].onfocus = function(){ inputFocusCount++; };
      inputs[i].onblur = function(){ inputFocusCount--; };
    }

    material = parseInt(document.getElementById('material').value, 10);
    environment = parseInt(document.getElementById('environment').value, 10);
    ui = new UI(gl, eye, material, environment, glossiness);
    ui.setObjects(makeStudy());
    const start = new Date();
    error.style.zIndex = "-1";
    setInterval(function(){ tick((new Date() - start) * 0.001); }, 1000 / 60);
  } else {
    error.innerHTML = 'Your browser does not support WebGL.';
  }
};

function elementPos(element) {
  let x = 0, y = 0;
  while(element.offsetParent) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

function eventPos(event) {
  return {
    x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
  };
}

function canvasMousePos(event) {
  const mousePos = eventPos(event);
  const canvasPos = elementPos(canvas);
  return {
    x: mousePos.x - canvasPos.x,
    y: mousePos.y - canvasPos.y
  };
}

let mouseDown = false, oldX, oldY;

document.addEventListener('mousedown', (event) => {
  const mouse = canvasMousePos(event);
  oldX = mouse.x;
  oldY = mouse.y;

  if (mouse.x >= 0 && mouse.x < 512 && mouse.y >= 0 && mouse.y < 512) {
    mouseDown = !ui.mouseDown(mouse.x, mouse.y);

    // disable selection because dragging is used for rotating the camera and moving objects
    event.preventDefault();
  }
});

document.addEventListener('mousemove', (event) => {
  const mouse = canvasMousePos(event);

  if (mouseDown) {
    // update the angles based on how far we moved since last time
    angleY -= (mouse.x - oldX) * 0.01;
    angleX += (mouse.y - oldY) * 0.01;

    // don't go upside down
    angleX = Math.max(angleX, -Math.PI / 2 + 0.01);
    angleX = Math.min(angleX, Math.PI / 2 - 0.01);

    // clear the sample buffer
    ui.renderer.pathTracer.sampleCount = 0;

    // remember this coordinate
    oldX = mouse.x;
    oldY = mouse.y;
  } else {
    // const canvasPos = elementPos(canvas);
    ui.mouseMove(mouse.x, mouse.y);
  }
});

document.addEventListener('mouseup', (event) => {
  mouseDown = false;

  const mouse = canvasMousePos(event);
  ui.mouseUp(mouse.x, mouse.y);
});

document.addEventListener('keydown', (event) => {
  // if there are no <input> elements focused
  if (inputFocusCount === 0) {
    // if backspace or delete was pressed
    if (event.key === 'Backspace' || event.key === 'Delete') {
      ui.deleteSelection();

      // don't let the backspace key go back a page
      event.preventDefault();
    }
  }
});


export function loadPresetScene(scene) {
  switch (scene) {
    case 'empty':
      ui.setObjects(makeEmpty());
      break;
    case 'room1':
      ui.setObjects(makeStudy());
      break;
    case 'room2':
      ui.setObjects(makeLivingRoom());
      break;
    default:
      console.error('Invalid scene name:', scene);
  }
}

document.querySelectorAll('.scene-button').forEach((button) => {
  button.addEventListener('click', () => {
    const sceneName = button.dataset.sceneName;
    loadPresetScene(sceneName);
  });
});



