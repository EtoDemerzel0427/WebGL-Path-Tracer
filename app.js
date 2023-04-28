import { CanvasAnimation } from "./dist/webglutils/CanvasAnimation.js";
import { UI } from './gui.js';
import { Cube, Sphere } from "./sceneObjects.js";
import { Vec3 } from "./dist/TSM.js";

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

export class PathTracerAnimation extends CanvasAnimation {
    static zoomZ = 2.5;
    static MATERIAL_GLOSSY = 2;
    constructor(canvas) {
        super(canvas);

        this.cur_time = new Date().getTime();
        this.angleX = 0;
        this.angleY = 0;
        this.eye = new Vec3([0, 0, PathTracerAnimation.zoomZ]);

        this.material = parseInt(document.getElementById('material').value, 10);
        this.environment = parseInt(document.getElementById('environment').value, 10);
        this.glossiness = 0.6;

        this.ui = new UI(this.ctx, this.canvas, this.material, this.environment, this.glossiness);
        this.ui.setObjects(makeStudy());

        const error = document.getElementById('error');
        error.style.zIndex = "-1";

        this.prevX = 0;
        this.prevY = 0;
        this.MouseDown = false;

        this.inputFocusCount = 0;

        // keep track of whether an <input> is focused or not (will be no only if inputFocusCount == 0)
        const inputs = document.getElementsByTagName('input');
        for(let i= 0; i < inputs.length; i++) {
            inputs[i].onfocus = function(){ this.inputFocusCount++; };
            inputs[i].onblur = function(){ this.inputFocusCount--; };
        }
    }

    draw() {
        const cur_time = new Date().getTime();
        this.eye.x = PathTracerAnimation.zoomZ * Math.sin(this.angleY) * Math.cos(this.angleX);
        this.eye.y = PathTracerAnimation.zoomZ * Math.sin(this.angleX);
        this.eye.z = PathTracerAnimation.zoomZ * Math.cos(this.angleY) * Math.cos(this.angleX);

        document.getElementById('glossiness-factor').style.display = (this.ui.material === PathTracerAnimation.MATERIAL_GLOSSY) ? 'inline' : 'none';

        this.ui.updateMaterial();
        this.ui.updateGlossiness();
        this.ui.updateEnvironment();
        this.ui.update(this.eye, (cur_time - this.cur_time) / 1000);
        this.ui.render();

        this.cur_time = cur_time;
    }


    mousedown(event) {
        this.prevX = event.offsetX;
        this.prevY = event.offsetY;
        if (event.offsetX >= 0 && event.offsetX < 512 && event.offsetY >= 0 && event.offsetY < 512) {
            this.MouseDown = !this.ui.mouseDown(event.offsetX, event.offsetY);

            // event.preventDefault();
        }
    }
    mousemove(event) {
        if (this.MouseDown) {
            this.angleY -= (event.offsetX - this.prevX) * 0.01;
            this.angleX += (event.offsetY - this.prevY) * 0.01;

            this.angleX = Math.max(this.angleX, -Math.PI / 2 + 0.01);
            this.angleX = Math.min(this.angleX, Math.PI / 2 - 0.01);

            this.ui.renderer.pathTracer.sampleCount = 0;

            this.prevX = event.offsetX;
            this.prevY = event.offsetY;
        } else {
            this.ui.mouseMove(event.offsetX, event.offsetY);
        }
    }

    mouseup(event) {
        this.MouseDown = false;

        this.ui.mouseUp(event.offsetX, event.offsetY);
    }

    keydown(event) {
        if (this.inputFocusCount === 0) {
            // if backspace or delete was pressed
            if (event.key === 'Backspace' || event.key === 'Delete') {
                this.ui.deleteSelection();

                // don't let the backspace key go back a page
                event.preventDefault();
            }
        }
    }

}

export function initializeCanvas() {
    const canvas = document.getElementById("canvas");
    /* Start drawing */
    const canvasAnimation = new PathTracerAnimation(canvas);
    function loadPresetScene(scene) {
        switch (scene) {
            case 'empty':
                console.log('Loading empty scene');
                canvasAnimation.ui.setObjects(makeEmpty());
                break;
            case 'room1':
                console.log('Loading room1 scene');
                canvasAnimation.ui.setObjects(makeStudy());
                break;
            case 'room2':
                console.log('Loading room2 scene');
                canvasAnimation.ui.setObjects(makeLivingRoom());
                break;
            default:
                console.error('Invalid scene name:', scene);
        }
    }

    canvas.addEventListener('mousedown', (event) => canvasAnimation.mousedown(event));
    canvas.addEventListener('mousemove', (event) => canvasAnimation.mousemove(event));
    canvas.addEventListener('mouseup', (event) => canvasAnimation.mouseup(event));
    document.addEventListener('keydown', (event) => canvasAnimation.keydown(event));

    document.querySelectorAll('.scene-button').forEach((button) => {
        button.addEventListener('click', () => {
            const sceneName = button.dataset.sceneName;
            loadPresetScene(sceneName);
        });
    });
    canvasAnimation.start();
}