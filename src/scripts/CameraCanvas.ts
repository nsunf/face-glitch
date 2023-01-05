import Canvas from "./canvas";

import { Face } from "@tensorflow-models/face-detection";

import Camera from "./Camera";
import FaceDetector from "./FaceDetector";

class CameraCanvas extends Canvas {
  public camera: Camera;
  public faceDetector: FaceDetector;

  public isBlurred: boolean;

  constructor() {
    super();
    this.camera = new Camera;
    this.faceDetector = new FaceDetector();
    this.isBlurred = true;

    // this.element.style.filter = 'blur(10px)';
    // this.element.style.transition = '7s';
    this.ctx.translate(innerWidth, 0);
    this.ctx.scale(-1, 1);
  }

  async setCamera() {
    await this.camera.setCamera();
  }

  setVideoOnloadedData(onloadeddata: () => void) {
    let video = this.camera.videoEl;
    if (!video) throw new Error('CameraCanvas.playVideo() error : video is undefined');
    video.onloadeddata = onloadeddata
  }

  playVideo() {
    let video = this.camera.videoEl;
    if (!video) throw new Error('CameraCanvas.playVideo() error : video is undefined');
    this.ctx.drawImage(video, (this.width - this.height*1.777)/2, 0, this.height*1.777, this.height);
  }
  drawImage(imgSrc: string) {
    let img = new Image();
    img.src = imgSrc;
    let ratio = img.height/img.width;
    let imgWidth = ratio < 1 ? this.width : this.height / ratio;
    let imgHeight = ratio < 1 ? this.height * ratio : this.height;
    this.ctx.drawImage(img, (this.width - imgWidth)/2, (this.height - imgHeight)/2, imgWidth, imgHeight)
  }

  async detectFace(): Promise<Face[]> {
    let faces = await this.faceDetector.detectFace(this.element) ?? [];
    Canvas.faces = faces;
    return faces;
  }

  toggleBlur(on: boolean) {
    if (this.isBlurred === on) return;
    this.isBlurred = on;
    this.element.style.filter = `blur(${on ? 20 : 0}px)`;
  }
}

export default CameraCanvas;