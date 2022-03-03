class SeedIcon extends Icon {
  constructor(x, y, iconImg, size, gardenSize) {
    super(x, y, iconImg, size);
    this.gardenSize = gardenSize;
    this.maxPlants = 15;
  }

  display() {
    // only display icon if there is less than 3 plants in the garden
    if (this.gardenSize < this.maxPlants) {
      super.display();
    }
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
      text("Plant a seed", this.x, this.textY);
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
      document.getElementById("SeedForm").style.display = "block";
      modalSeedOpen = true;
      console.log(modalSeedOpen);
    }
  }
}
