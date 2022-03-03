// black rectangle that appears between `new-user` and `pod-navigation` states

class RectangleTransition {
  constructor() {
    this.x = windowWidth / 2;
    this.y = windowHeight / 2;
    this.width = windowWidth;
    this.height = windowHeight;
    this.fill = {
      r: 0,
      g: 0,
      b: 0,
      alpha: 0,
      alphaChangeSpeed: 5,
      // true if time to fade out
      alphaFadeOut: false,
    };
    // keeps track if rectangle should be displayed
    this.active = true;
  }

  // all behaviour
  update() {
    // make it fade in and out
    this.fadeInAndOut();

    // display rectangle
    this.display();
  }

  // display rectangle only when active
  display() {
    console.log(this.fill.alpha);
    if (this.active) {
      push();
      rectMode(CENTER);
      fill(this.fill.r, this.fill.g, this.fill.b, this.fill.alpha);
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }

  // make it fade in and out between states
  fadeInAndOut() {
    // fading in
    if (!this.fill.alphaFadeOut) {
      this.fadeIn();
    }
    // else wait 2 seconds, then fade out
    else {
      setTimeout(this.fadeOut.bind(this), 2000);
    } // else fade out
  }

  // fade in
  fadeIn() {
    this.fill.alpha += this.fill.alphaChangeSpeed;
    // switch to fading out
    if (this.fill.alpha >= 255) {
      this.fill.alphaFadeOut = true;
    }
  }

  // fade out
  fadeOut() {
    this.fill.alpha -= this.fill.alphaChangeSpeed;
    // faded out completely: rectangle no longer displayed
    if (this.fill.alpha <= 0) {
      this.active = false;
    }
  }
}
