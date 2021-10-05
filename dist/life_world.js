import { properMod } from "./extraMath.js";
export class LifeWorld {
    constructor(xSize, ySize) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.blankInit();
    }
    getCell(x, y) {
        return this.grid[x][y];
    }
    getXSize() {
        return this.xSize;
    }
    getYSize() {
        return this.ySize;
    }
    blankInit() {
        this.grid = [];
        this.buffer = [];
        for (let x = 0; x < this.xSize; ++x) {
            this.grid.push(new Array(this.ySize).fill(0));
            this.buffer.push(new Array(this.ySize).fill(0));
        }
    }
    randomInit(popDensity) {
        this.blankInit();
        for (let x = 0; x < this.getXSize(); ++x) {
            for (let y = 0; y < this.getYSize(); ++y) {
                this.grid[x][y] = Math.random() < popDensity ? 1 : 0;
            }
        }
    }
    numNeighbours(x, y) {
        let total = 0;
        for (let dx = -1; dx < 2; ++dx) {
            for (let dy = -1; dy < 2; ++dy) {
                if (dx === 0 && dy === 0)
                    continue;
                const xNeighbour = properMod(x + dx, this.getXSize());
                const yNeighbour = properMod(y + dy, this.getYSize());
                total += this.grid[xNeighbour][yNeighbour];
            }
        }
        return total;
    }
    step() {
        for (let x = 0; x < this.getXSize(); ++x) {
            for (let y = 0; y < this.getYSize(); ++y) {
                const nn = this.numNeighbours(x, y);
                if (this.grid[x][y] === 0) {
                    if (nn === 3) {
                        this.buffer[x][y] = 1;
                    }
                    else {
                        this.buffer[x][y] = 0;
                    }
                }
                else if (this.grid[x][y] === 1) {
                    if (nn === 2 || nn === 3) {
                        this.buffer[x][y] = 1;
                    }
                    else {
                        this.buffer[x][y] = 0;
                    }
                }
            }
        }
        let temp = this.grid;
        this.grid = this.buffer;
        this.buffer = temp;
    }
}
