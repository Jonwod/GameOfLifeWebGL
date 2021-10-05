export class LifeModel {
    constructor(xSize, ySize) {
        for (let x = 0; x < xSize; ++x) {
            this.grid.push(new Array(ySize).fill(false));
        }
    }
}
