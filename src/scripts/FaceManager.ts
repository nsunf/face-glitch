import { Face } from "@tensorflow-models/face-detection";

import Particle from "./Particle";
import Circle from "./Circle";
import FaceRecognition from "./FaceRecognition";

class FaceManager {
  static nextID = 0;

  public id;
  public face?: Face;
  public faceIDUI: FaceRecognition;

  private phase: number;
  private timers: NodeJS.Timeout[];

  private largeKeypointsParticles: Particle[]
  private smallKeypointsParticles: Particle[]
  private smallParticles1: Particle[]
  private smallParticles2: Particle[]
  private rectParticles: Particle[]
  private circles: Circle[]

  private circleLength: number;

  constructor() {
    this.id = FaceManager.nextID;
    FaceManager.nextID++;

    this.face = undefined;
    this.faceIDUI = new FaceRecognition();

    this.phase = 0;
    this.timers = [];
    this.largeKeypointsParticles = [];
    this.smallKeypointsParticles = [];
    this.smallParticles1 = [];
    this.smallParticles2 = [];
    this.rectParticles = [];
    this.circles = [];

    this.circleLength = 0;
  }

  setFace(face: Face) {
    this.face = face;
  }

  reset() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.face = undefined;
    this.phase = 0;
    this.largeKeypointsParticles = [];
    this.smallKeypointsParticles = [];
    this.smallParticles1 = [];
    this.smallParticles2 = [];
    this.rectParticles = [];
    this.circles = [];

    this.circleLength = 0;
    this.faceIDUI.reset();
  }

  draw(captureCtx: CanvasRenderingContext2D, drawCtx: CanvasRenderingContext2D) {
    if (!this.face) return;
    // if (this.phase === 0) {
    //   this.phase = -1;
    //   setTimeout(() => {
    //     this.phase = 5
    //   }, 3000);
    // };
    switch (this.phase) {
      case 0:
        let timeout1 = setTimeout(() => {
            this.phase = 1;
        }, 3000);
        this.timers.push(timeout1);
        break;
      case 1:
        this.timers.forEach(timer => clearTimeout(timer));
        this.phase = 2;
        break;
      case 2:
        this.setFaceRecognition();
        this.faceIDUI.update(drawCtx, false);
        let timeout2 = setTimeout(() => {
          this.phase = 3;
        }, 4000);
        this.timers.push(timeout2);
        break;
      case 3:
        this.setFaceRecognition();
        this.faceIDUI.update(drawCtx, false);
        this.timers.forEach(timer => clearTimeout(timer));
        this.phase = 4;
        break;
      case 4:
        this.setFaceRecognition();
        this.faceIDUI.update(drawCtx, true);
        let timeout3 = setTimeout(() => {
          this.phase = 5;
        }, 1000);
        this.timers.push(timeout3);
        break;
      case 5:
        this.timers.forEach(timer => clearTimeout(timer));
        if (this.faceIDUI.fadeOut(drawCtx)){
          this.phase = 6;
        }
        break;
      case 6:
        drawCtx.globalAlpha = 1;
        this.drawCircles(drawCtx);
        this.getCircle(captureCtx, this.circleLength);
        this.circleLength = Math.min(this.circleLength + 4, 200);
        if (this.circleLength === 200) this.phase = 7;
        break;
      case 7:
        this.drawCircles(drawCtx);

        this.drawRect(drawCtx, 'glitch');
        this.drawKeypointsParticles(drawCtx, 'large', 'glitch');
        this.drawKeypointsParticles(drawCtx, 'small', 'color');
        this.drawSmallParticles(drawCtx, 1, 'glitch');
        this.drawSmallParticles(drawCtx, 2, 'color');

        this.getCircle(captureCtx, this.circleLength);

        let splitter = Math.random();
        if (splitter > 0.96) {
          this.getRectParticles(captureCtx);
        } else if (splitter > 0.92) {
          this.getKeypointsParticles(captureCtx, 'large');
        } else if (splitter > 0.88) {
          this.getKeypointsParticles(captureCtx, 'small');
        } else if (splitter > 0.84) {
          this.getSmallParticles(captureCtx, 1);
        } else if (splitter > 0.8) {
          this.getSmallParticles(captureCtx, 2);
        }
        break;
      default: 
        break;
    }
  }

  getFaceOffset(face: Face): number {
    let xMinOffset = Math.abs(this.face!.box.xMin - face.box.xMin);
    let yMinOffset = Math.abs(this.face!.box.yMin - face.box.yMin);
    let xMaxOffset = Math.abs(this.face!.box.xMax - face.box.xMax);
    let yMaxOffset = Math.abs(this.face!.box.yMax - face.box.yMax);
    let widthOffset = Math.abs(this.face!.box.width - face.box.width);
    let heightOffset = Math.abs(this.face!.box.height - face.box.height);

    return (xMinOffset + yMinOffset + xMaxOffset + yMaxOffset + widthOffset + heightOffset)/6;
  }

  getKeypointsParticles(ctx: CanvasRenderingContext2D ,type:'small'|'large') {
    if (!this.face) return [];
    let { box, keypoints } = this.face;

    let particles: Particle[] = [];

    keypoints.forEach(keypoint => {
      let w = 1, h = 1, x = 0, y = 0;

      switch (keypoint.name) {
        case 'leftEye':
          w = type === 'small' ?
            box.width/5 + Math.random() * 10:
            box.width/4 + Math.random() * 10;
          h = type ==='small' ? 
            box.height/10 + Math.random() * 10:
            box.height/5 + Math.random() * 10;
          x = keypoint.x - w/1.75;
          y = type === 'small' ? keypoint.y - h/1.55 : keypoint.y - h/1.7;
          break;
        case 'rightEye':
          w = type === 'small' ?
            box.width/5 + Math.random() * 10 :
            box.width/4 + Math.random() * 15;
          h = type ==='small' ? 
            box.height/10 + Math.random() * 10 :
            box.height/5 + Math.random() * 10;
          x = keypoint.x - w/1.8;
          y = type === 'small' ? keypoint.y - h/1.5 : keypoint.y - h/1.6;
          break;
        case 'noseTip':
          w = type === 'small' ?
            box.width/4 + Math.random() * 10 :
            box.width/4 + Math.random() * 20;
          h = type ==='small' ? 
            box.height/7 + Math.random() * 10 :
            box.height/3 + Math.random() * 10;
          x = keypoint.x - w/1.75;
          y = type === 'small' ? keypoint.y - h/2 : keypoint.y - h/1.5;
          break;
        case 'rightEarTragion':
          w = type === 'small' ?
            box.width/5 + Math.random() * 10 :
            box.width/5 + Math.random() * 10;
          h = type ==='small' ? 
            box.height/10 + Math.random() * 30 :
            box.height/2.8 + Math.random() * 10;
          x = type === 'small' ? keypoint.x - w/1.5 : keypoint.x - w/1.5;
          y = keypoint.y - h/1.75;
          break;
        case 'leftEarTragion':
          w = type === 'small' ?
            box.width/5 + Math.random() * 10 :
            box.width/5 + Math.random() * 10;
          h = type === 'small' ? 
            box.height/10 + Math.random() * 15 :
            box.height/3 + Math.random() * 20;
          x = type === 'small' ? keypoint.x - w/5 : keypoint.x - w/2.6;
          y = type === 'small' ? keypoint.y : keypoint.y - h/1.5;
          break;
        case 'mouthCenter':
          w = type === 'small' ?
            box.width/3.5 + Math.random() * 10 :
            box.width/3 + Math.random() * 20;
          h = type === 'small' ? 
            box.height/10 + Math.random() * 20 :
            box.height/5 + Math.random() * 10;
          x = keypoint.x - w/2;
          y = keypoint.y - h/1.75;
          break;
        default: 
          console.log('missed ' + keypoint.name);
          break;
      }
      
      let imgData = ctx.getImageData(x, y, w, h);

      let dx = Math.random() * (box.xMax - box.xMin + 3*w) + box.xMin - w * 1.5;
      let dy = Math.random() * (box.yMax - box.yMin + 3*h) + box.yMin - 2*h;
      let ratioX = (dx - box.xMin) / box.width;
      let ratioY = (dy - box.yMin) / box.height;
      particles.push(new Particle(imgData, {box, ratioX, ratioY}));
    })
    if (type === 'small') {
      this.smallKeypointsParticles = particles;
    } else {
      this.largeKeypointsParticles = particles;
    }
  }
  getSmallParticles(ctx: CanvasRenderingContext2D, type: 1|2) {
    if (!this.face) return [];
    let { box } = this.face;

    let particles: Particle[] = [];

    for (let i = 0; i < 30; i++) {
      let w = box.width/100 + Math.random() * 50;
      let h = (Math.random() * 400 + 100)/w;
      let x = Math.random() * (box.xMax - box.xMin) + box.xMin;
      let y = Math.random() * (box.yMax - box.yMin) + box.yMin;
      let imgData = ctx.getImageData(x, y, w, h);

      let dx = Math.random() * (box.xMax - box.xMin + 2*w) + box.xMin - w;
      let dy = Math.random() * (box.yMax - box.yMin + 2*h) + box.yMin - h;
      let ratioX = (dx - box.xMin) / box.width;
      let ratioY = (dy - box.yMin) / box.height;
      particles.push(new Particle(imgData, {box, ratioX, ratioY}));
    }
    if (type === 1) {
      this.smallParticles1 = particles;
    } else {
      this.smallParticles2 = particles;
    }
  }
  getRectParticles(ctx: CanvasRenderingContext2D) {
    if (!this.face) return [];
    let { box } = this.face;

    let particles: Particle[] = [];

    let w = box.width/2;
    let h = 5;
    let x = Math.random() * (box.xMax - w - box.xMin) + box.xMin;
    let y = Math.random() * (box.yMax - h - box.yMin) + box.yMin;
    let imgData = ctx.getImageData(x, y, w, h + 2);

    for (let i = 0; i < box.height/2; i += h) {
      let dy = y + i; 
      let ratioX = (x - box.xMin)/box.width; 
      let ratioY = (dy - box.yMin)/box.height; 
      particles.push(new Particle(imgData, {box, ratioX, ratioY}));
    }
    this.rectParticles = particles;
  }
  getCircle(ctx: CanvasRenderingContext2D, length: number) {
    if (!this.face) return [];
    let { box } = this.face;

    let circles: Circle[] = [];

    let pixels = ctx.getImageData(box.xMin, box.yMin, box.width, box.height);
    for (let i = 0; i < length; i++) {
      let x = Math.floor(Math.random() * pixels.width);
      let y = Math.floor(Math.random() * pixels.height);

      let idx = (x + y * pixels.width) * 4;
      let r = pixels.data[idx];
      let g = pixels.data[idx + 1];
      let b = pixels.data[idx + 2];
      let color = `rgb(${r}, ${g}, ${b})`;
      // let radius = Math.round(Math.random() * box.width/30 + box.width/30); 
      let radius = Math.round(Math.random() * box.width/30 + box.width/20); 
      circles.push(new Circle(box.xMin + x, box.yMin + y, radius, color));
    }
    this.circles = circles;
  }
  setFaceRecognition() {
    if (!this.face) return;
    this.faceIDUI.setFace(this.face);
  }
  drawFaceTracker(ctx: CanvasRenderingContext2D, i: number) {
    if (!this.face) return;
    let { box, keypoints } = this.face;
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;
    ctx.strokeRect(box.xMin, box.yMin, box.width, box.height);
    ctx.font = '50px serif';
    ctx.fillText(`${i}`, box.xMin, box.yMin);
    ctx.fillStyle = 'red';

    keypoints.forEach(keypoint => {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    })
  }

  drawKeypointsParticles(ctx: CanvasRenderingContext2D, type: 'small'|'large', filter: 'color'|'glitch') {
    if (!this.face) return [];
    let box = this.face.box;
    if (type === 'small') {
      this.smallKeypointsParticles.forEach(particle => particle.drawToFace(ctx, box, filter));
    } else {
      this.largeKeypointsParticles.forEach(particle => particle.drawToFace(ctx, box, filter));
    }
  }

  drawSmallParticles(ctx: CanvasRenderingContext2D, type: 1|2, filter: 'color'|'glitch') {
    if (!this.face) return [];
    let box = this.face.box;
    if (type === 1) {
      this.smallParticles1.forEach(particle => particle.drawToFace(ctx, box, filter));
    } else {
      this.smallParticles2.forEach(particle => particle.drawToFace(ctx, box, filter));
    }
  }

  drawRect(ctx: CanvasRenderingContext2D, filter: 'color'|'glitch') {
    if (!this.face) return [];
    let box = this.face.box;
    let particles = this.rectParticles;
    particles.forEach(particle => {
      particle.drawToFace(ctx, box, filter);
    })
  }
  drawCircles(ctx: CanvasRenderingContext2D) {
    let circles = this.circles;
    circles.forEach(circle => {
      circle.draw(ctx);
    })
  }
}

export default FaceManager;