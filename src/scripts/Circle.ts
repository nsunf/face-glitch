class Circle {
  public x: number;
  public y: number;
  public r: number;
  public color: string;
  constructor(x: number, y: number, r: number, color: string) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
}

export default Circle;