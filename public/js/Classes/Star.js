class Star {
  constructor() {
    this.x = random(0, canvasWidth);
    this.y = random(0, canvasWidth);
    this.alpha = 125;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0.5;
    this.size = 10;
    this.fill = 255;
  }

  // Set all of the star's behaviour
  update() {
    this.setSize();
    this.display();
    this.move();
  }

  // Set the star's size based on the current state
  setSize() {
    if (state === `new-user` || state === `pod-navigation`) {
      this.size = 5;
    } else if (state === `inside-pod`) {
      this.size = 10;
    }
  }

  // Display star as a blinking circle
  display() {
    push();
    noStroke();
    fill(21, 136, 146, this.alpha);

    if (random() < 0.5) {
      this.alpha -= 20;
    } else {
      this.alpha += 20;
    }

    ellipse(this.x, this.y, this.size);
    pop();
  }

  // Random movement and constrain star
  move() {
    if (random() < 0.05) {
      this.vx = random(-this.speed, this.speed);
      this.vy = random(-this.speed, this.speed);
    }

    this.x = constrain(this.x, 0, canvasWidth);
    this.y = constrain(this.y, 0, canvasWidth);

    this.x += this.vx;
    this.y += this.vy;
  }
}
