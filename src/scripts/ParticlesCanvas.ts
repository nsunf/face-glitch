import Canvas from "./canvas";
import FaceManager from "./FaceManager";

class ParticlesCanvas extends Canvas {
  constructor() {
    super();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // drawFaceTracker(faceManager: FaceManager, i: number) {
  //   let face = faceManager.face;
  //   if (!face) return;
  //   let { box, keypoints } = face;
  //   this.ctx.strokeStyle = 'blue';
  //   this.ctx.lineWidth = 4;
  //   this.ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
  //   this.ctx.font = '50px serif';
  //   this.ctx.fillText(`${i}`, box.xMin, box.yMin);
  //   this.ctx.fillStyle = 'red';

  //   keypoints.forEach(keypoint => {
  //     this.ctx.beginPath();
  //     this.ctx.arc(keypoint.x, keypoint.y, 5, 0, Math.PI * 2);
  //     this.ctx.fill();
  //     this.ctx.closePath();
  //   })
  // }
}

export default ParticlesCanvas;