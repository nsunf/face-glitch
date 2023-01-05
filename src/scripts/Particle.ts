import { BoundingBox } from "@tensorflow-models/face-detection/dist/shared/calculators/interfaces/shape_interfaces";

class Particle {
  imgData: ImageData;
  box?: BoundingBox; 
  x: number = 0;
  y: number = 0;
  ratioX: number = 0;
  ratioY: number = 0;
  constructor(imgData: ImageData, {box, x, y, ratioX, ratioY} :{box?: BoundingBox, x?: number, y?: number, ratioX?: number, ratioY?: number}) {
    this.imgData = imgData;
    if (box) {
      this.box = box;
    }

    this.x = x ?? 0;
    this.y = y ?? 0;
    this.ratioX = ratioX ?? 0;
    this.ratioY = ratioY ?? 0;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.putImageData(this.imgData, this.x, this.y);
  }
  drawToFace(ctx: CanvasRenderingContext2D, box: BoundingBox, filter: 'color'|'glitch') {
    let x = box.xMin + this.ratioX * box.width;
    let y = box.yMin + this.ratioY * box.height;
    switch (filter) {
      case 'color':
        ctx.putImageData(this.colorFilteredImageData(), x, y);
        break;
      case 'glitch':
        ctx.putImageData(this.glitchFilteredImageData(), x, y);
        break;
    }
  }
  colorFilteredImageData(): ImageData {
    let newImgData = this.imgData;
    if (Math.random() < 0.98) return newImgData;
    let colorSplitter = (Math.random() - 0.5) < 0;
    for (let i = 0; i < newImgData.height; i++) {
      for (let j = 0; j < newImgData.width; j++) {
        let idx = j * 4 + i * 4 * newImgData.width;
        if (colorSplitter) {
          newImgData.data[idx + 1] = 0;
        } else {
          newImgData.data[idx + 0] = 0;
        }
      }
    }
    return newImgData;
  }
  glitchFilteredImageData(): ImageData {
    let newImgData = this.imgData;
    if (Math.random() < 0.99) return newImgData;
    for (let i = 0; i < newImgData.height; i++) {
      for (let j = 0; j < newImgData.width; j++) {
        let idx = j * 4 + i * 4 * newImgData.width;
        if (Math.random() - 0.5 < 0) {
          newImgData.data[idx + 1] = 0;
        } else {
          newImgData.data[idx + 0] = 0;
        }
      }
    }
    return newImgData;
  }
}

export default Particle;