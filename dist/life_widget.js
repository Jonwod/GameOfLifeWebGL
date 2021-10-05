import { loadShader } from './gl_helpers.js';
import { LifeWorld } from './life_world.js';
export class LifeWidget {
    constructor(xSize, ySize, pixelsPerCell) {
        this.vertexShaderSource = `
        attribute vec4 aVertexPosition;
    
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
    
        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
       `;
        this.fragmentShaderSource = `
        void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
       `;
        this.world = new LifeWorld(xSize, ySize);
        this.world.randomInit(0.3);
        this.cellPixels = pixelsPerCell;
    }
    initShaderProgram() {
        const gl = this.gl;
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, this.vertexShaderSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, this.fragmentShaderSource);
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        return shaderProgram;
    }
    draw() {
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const gridZRender = -100;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }
        gl.useProgram(programInfo.program);
        for (let x = 0; x < this.world.getXSize(); ++x) {
            for (let y = 0; y < this.world.getYSize(); ++y) {
                if (this.world.getCell(x, y)) {
                    const modelViewMatrix = mat4.create();
                    const xRender = x - this.world.getXSize() / 2;
                    const yRender = y - this.world.getYSize() / 2;
                    mat4.translate(modelViewMatrix, modelViewMatrix, [xRender, yRender, gridZRender]);
                    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
                    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
                    {
                        const offset = 0;
                        const vertexCount = 4;
                        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
                    }
                }
            }
        }
    }
    initBuffers(gl) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -0.5, 0.5,
            0.5, 0.5,
            -0.5, -0.5,
            0.5, -0.5,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        return {
            position: positionBuffer,
        };
    }
    createHtml() {
        let div = document.createElement("div");
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.world.getXSize() * this.cellPixels;
        this.canvas.height = this.world.getYSize() * this.cellPixels;
        this.gl = this.canvas.getContext("webgl");
        if (this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return null;
        }
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const shaderProgram = this.initShaderProgram();
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
        };
        this.buffers = this.initBuffers(this.gl);
        div.appendChild(this.canvas);
        return div;
    }
    stepAndRedraw() {
        this.world.step();
        this.draw();
    }
}
