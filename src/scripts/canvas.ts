import { Face } from '@tensorflow-models/face-detection';

class Canvas {
  static faces: Face[];
  public element: HTMLCanvasElement = document.createElement('canvas');
  public ctx: CanvasRenderingContext2D = this.element.getContext('2d')!;
  constructor() {
    document.getElementById('root')?.appendChild(this.element);
    this.setSize();
    window.addEventListener('resize', () => {
      this.setSize();
    })
  }
  setSize() {
    this.element.width = innerWidth;
    this.element.height = innerHeight;
  }
  get width() {
    return this.element.width;
  }
  get height() {
    return this.element.height;
  }
}

export default Canvas;