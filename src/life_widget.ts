import {loadShader} from './gl_helpers.js';
import {LifeWorld} from './life_world.js';
declare var mat4: any;
// var mat4 = glMatrix.mat4;
// import {mat4} from "gl-matrix";

// var mat4 = glMatrix.glMatrix.mat4;
// f.glMatrix.mat4;

export class LifeWidget {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private vertexShaderSource: String;
    private fragmentShaderSource: String;
    private world: LifeWorld;
    private cellPixels: number;

    private programInfo: {
        program: WebGLProgram;
        attribLocations: {
            vertexPosition: number;
        };
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation;
            modelViewMatrix: WebGLUniformLocation;
        }
    };
    private buffers: {
        position;
    }

    constructor(xSize: number, ySize: number, pixelsPerCell: number) {
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
      
        // Create the shader program
      
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
      
        // If creating the shader program failed, alert
      
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
          return null;
        }
      
        return shaderProgram;
    }

    public draw() {
        const gl = this.gl;
        const programInfo = this.programInfo;
        const buffers = this.buffers;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
      
        // Clear the canvas before we start drawing on it.
      
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      
        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.
      
        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const gridZRender = -60;
        const projectionMatrix = mat4.create();
      
        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.perspective(projectionMatrix,
                         fieldOfView,
                         aspect,
                         zNear,
                         zFar);
      

      
        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
          const numComponents = 2;  // pull out 2 values per iteration
          const type = gl.FLOAT;    // the data in the buffer is 32bit floats
          const normalize = false;  // don't normalize
          const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
          const offset = 0;         // how many bytes inside the buffer to start from
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
          gl.vertexAttribPointer(
              programInfo.attribLocations.vertexPosition,
              numComponents,
              type,
              normalize,
              stride,
              offset);
          gl.enableVertexAttribArray(
              programInfo.attribLocations.vertexPosition);
        }
      
        // Tell WebGL to use our program when drawing
      
        gl.useProgram(programInfo.program);
      
        for(let x = 0; x < this.world.getXSize(); ++x) {
            for(let y = 0; y < this.world.getYSize(); ++y) {
                if(this.world.getCell(x,y)) {
                    // Set the drawing position to the "identity" point, which is
                    // the center of the scene.
                    const modelViewMatrix = mat4.create();
                    const xRender = x - this.world.getXSize()/2;
                    const yRender = y - this.world.getYSize()/2;
                    
                    mat4.translate(modelViewMatrix,     // destination matrix
                                modelViewMatrix,     // matrix to translate
                                [xRender, yRender, gridZRender]);  // amount to translate
                    
                    // Set the shader uniforms
                    gl.uniformMatrix4fv(
                        programInfo.uniformLocations.projectionMatrix,
                        false,
                        projectionMatrix);
                    gl.uniformMatrix4fv(
                        programInfo.uniformLocations.modelViewMatrix,
                        false,
                        modelViewMatrix);
                
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
        // Create a buffer for the square's positions.
      
        const positionBuffer = gl.createBuffer();
      
        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.
      
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      
        // Now create an array of positions for the square.
      
        const positions = [
          -1.0,  1.0,
           1.0,  1.0,
          -1.0, -1.0,
           1.0, -1.0,
        ];
      
        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
      
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(positions),
                      gl.STATIC_DRAW);
      
        return {
          position: positionBuffer,
        };
    }
      

    createHtml(): HTMLElement {
        let div = document.createElement("div");
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.world.getXSize() * this.cellPixels;
        this.canvas.height = this.world.getYSize() * this.cellPixels;
        this.gl = this.canvas.getContext("webgl");
        if(this.gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return null;
        }

        this.gl.clearColor(0,0,0,1);
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

    public stepAndRedraw() {
        this.world.step();
        this.draw();
    }
}

// References: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context