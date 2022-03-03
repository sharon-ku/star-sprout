class HomeIcon extends Icon {
  constructor(x, y, iconImg, size, newCanvasWidth, newCanvasHeight) {
    super(x, y, iconImg, size);

    this.newCanvasWidth = newCanvasWidth;
    this.newCanvasHeight = newCanvasHeight;
  }

  display() {
    super.display();
  }

  overlap() {
    super.overlap();

    if (
      mouseX > this.x &&
      mouseX < this.x + this.size &&
      mouseY > this.y &&
      mouseY < this.y + this.size
    ) {
      push();
      textSize(15);
      textFont(this.font);
      fill(this.aqua.r, this.aqua.g, this.aqua.b);
      text("Go Back", this.x, this.textY);
      pop();
    }
  }

  mousePressed() {
    // if mouse touches icon
    if (
      mouseX > this.x &&
      mouseX < this.x + this.size &&
      mouseY > this.y &&
      mouseY < this.y + this.size
    ) {
      state = `pod-navigation`;

      // empty out visit garden array plants
      visitGarden = [];

      // resize canvas
      resizeCanvas(this.newCanvasWidth, this.newCanvasHeight);
    }
  }
}
