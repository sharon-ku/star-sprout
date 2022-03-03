class Icon {
  constructor(x, y, iconImg, size) {
    this.x = x;
    this.y = y;
    this.img = iconImg;
    this.size = size;

    this.textY = this.y + this.size * 1.25;
    this.aqua = {
      r: 45,
      g: 227,
      b: 240,
    };
    this.lineWeight = 4;
    this.borderRad = 10;
    this.font = `quicksand,sans-serif`;
  }

  display() {
    // looking for reference point
    // push();
    // stroke(0);
    // strokeWeight(8);
    // point(this.x, this.y);
    // pop();

    push();
    imageMode(CORNER);

    image(this.img, this.x, this.y, this.size, this.size);
    pop();
  }

  overlap() {
    if (
      mouseX > this.x &&
      mouseX < this.x + this.size &&
      mouseY > this.y &&
      mouseY < this.y + this.size
    ) {
      cursor("pointer");
      // console.log("hovering");
      push();
      imageMode(CORNER);
      strokeWeight(this.lineWeight);
      stroke(this.aqua.r, this.aqua.g, this.aqua.b);
      noFill();
      rect(this.x, this.y, this.size, this.size, this.borderRad);
      pop();
    }
  }
}
