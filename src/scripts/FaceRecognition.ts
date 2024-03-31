import { Face } from "@tensorflow-models/face-detection";

export default class FaceRecognition {
  public angle: number;
  public alpha: number;
  public keypointsAlpha: number;
  public faceIconSize: number;
  public faceIconRadius: number;

  public face?: Face;

  constructor() {
    this.angle = 0;
    this.alpha = 0;
    this.keypointsAlpha = 0;
    this.faceIconSize = 50;
    this.faceIconRadius = 10;
  }

  setFace(face: Face) {
    this.face = face;
  }

  reset() {
    this.angle = 0;
    this.alpha = 0;
    this.keypointsAlpha = 0;
    this.faceIconRadius = 10;
  }

  draw(ctx: CanvasRenderingContext2D, color: 'white'|'lawngreen' = 'white') {
    if (!this.face) return;
    let { box, keypoints } = this.face;

    let cx = Math.floor(box.xMin + box.width/2);
    let cy = Math.floor(box.yMin + box.height/2);

    let size = Math.floor(box.width) - Math.sin(this.angle) * 50;

    ctx.strokeStyle = color === 'white' ? `rgba(255, 255, 255, ${this.alpha})`:`rgba(124, 252, 0, ${this.alpha})`;
    ctx.fillStyle = color === 'white' ? `rgba(255, 255, 255, ${this.alpha})`:`rgba(124, 252, 0, ${this.alpha})`;

    // face icon
    let iSize = 50;
    let iRad = this.faceIconRadius;
    let iCX = cx;
    let iCY = cy - size/1.25 + iSize/2;

    ctx.globalCompositeOperation = 'xor';

    // round rect
    ctx.beginPath();
    ctx.moveTo(iCX, iCY - iSize/2);
    ctx.lineTo(iCX + iSize/2 - iRad, iCY - iSize/2);
    ctx.arcTo(iCX + iSize/2, iCY - iSize/2, iCX + iSize/2, iCY + iRad, iRad);
    ctx.lineTo(iCX + iSize/2, iCY + iSize/2 - iRad);
    ctx.arcTo(iCX + iSize/2, iCY + iSize/2, iCX + iSize/2 - iRad, iCY + iSize/2, iRad);
    ctx.lineTo(iCX - iSize/2 + iRad, iCY + iSize/2);
    ctx.arcTo(iCX - iSize/2, iCY + iSize/2, iCX - iSize/2, iCY + iSize/2 - iRad, iRad);
    ctx.lineTo(iCX - iSize/2, iCY - iSize/2 + iRad);
    ctx.arcTo(iCX - iSize/2, iCY - iSize/2, iCX - iSize/2 + iRad, iCY - iSize/2, iRad)
    ctx.closePath();
    ctx.fill();

    // face clip
    ctx.lineWidth = 5;
    ctx.beginPath();
    // eyes
    ctx.moveTo(iCX - 10, iCY - 10);
    ctx.lineTo(iCX - 10, iCY);
    ctx.moveTo(iCX + 10, iCY - 10);
    ctx.lineTo(iCX + 10, iCY);
    // nose
    ctx.lineWidth = 2;
    ctx.moveTo(iCX, iCY - 4);
    ctx.lineTo(iCX - 2, iCY + 5);
    ctx.lineTo(iCX + 2, iCY + 5);
    ctx.lineTo(iCX - 2, iCY + 5);

    ctx.closePath();
    // mouth
    ctx.moveTo(iCX - Math.cos(Math.PI/3) * 14, iCY + Math.sin(Math.PI/3) * 14);
    ctx.arc(iCX, iCY, 14, Math.PI/9 * 6, Math.PI/9 * 3, true)

    ctx.stroke();

    // face box
    ctx.globalCompositeOperation = 'source-over';

    let xMin = cx - size/2;
    let xMax = cx + size/2;
    let yMin = cy - size/2;
    let yMax = cy + size/2;

    let length = size / 3.75;
    let lineWidth = size / 37.5;
    let radius = 25;

    ctx.lineWidth = lineWidth;

    ctx.beginPath();

    ctx.moveTo(xMin + length, yMin);
    ctx.arcTo(xMin, yMin, xMin, yMin + length, radius)
    ctx.lineTo(xMin, yMin + length);

    ctx.moveTo(xMin + length, yMax);
    ctx.arcTo(xMin, yMax, xMin, yMax - length, radius);
    ctx.lineTo(xMin, yMax - length);

    ctx.moveTo(xMax - length, yMin);
    ctx.arcTo(xMax, yMin, xMax, yMin + length, radius);
    ctx.lineTo(xMax, yMin + length);

    ctx.moveTo(xMax - length, yMax);
    ctx.arcTo(xMax, yMax, xMax, yMax - length, radius);
    ctx.lineTo(xMax, yMax - length);

    ctx.stroke();

    // keypoints
    ctx.strokeStyle = color === 'white' ? `rgba(255, 255, 255, ${this.keypointsAlpha})`:`rgba(124, 252, 0, ${this.keypointsAlpha})`;
    ctx.fillStyle = color === 'white' ? `rgba(255, 255, 255, ${this.keypointsAlpha})`:`rgba(124, 252, 0, ${this.keypointsAlpha})`;
    keypoints.forEach(keypoint => {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, size/50, Math.PI * 2, 0);
      ctx.closePath();
      ctx.fill();
    })
  }

  update(ctx: CanvasRenderingContext2D, widthKeypoints: boolean) {
    if (widthKeypoints) {
      this.angle = Math.min(Math.PI, this.angle + 0.1);
      this.keypointsAlpha = Math.min(1, this.keypointsAlpha + 0.1);
      this.faceIconRadius = Math.min(this.faceIconSize/2, this.faceIconRadius + 2);
      this.draw(ctx, 'lawngreen');
    } else {
      this.angle = this.angle % Math.PI;
      this.angle += 0.15;
      this.alpha = Math.min(1, this.alpha + 0.05);
      this.draw(ctx);
    }
  }

  fadeOut(ctx: CanvasRenderingContext2D): boolean {
    this.alpha = Math.max(0, this.alpha - 0.1);
    this.keypointsAlpha = Math.max(0, this.keypointsAlpha - 0.1);
    this.draw(ctx, 'lawngreen');
    return this.alpha <= 0;
  }
}