class Greenhouse {
  constructor(x, y, podImage, newCanvasWidth, newCanvasHeight, taken) {
    this.x = x;
    this.y = y;
    this.podImage = podImage;
    // this.alpha = undefined; // image transparency
    this.scale = 1;
    this.taken = taken;
    this.tint = {
      r: 255,
      g: 255,
      b: 255,
      alpha: undefined, // image transparency
    };

    this.newCanvasWidth = newCanvasWidth;
    this.newCanvasHeight = newCanvasHeight;
  }

  update() {
    this.display();

    if (this.overlap()) {
      this.scale = 1.2;
    } else {
      this.scale = 1;
    }
  }

  display() {
    push();
    imageMode(CENTER);

    // If new user, we want unoccupied to be full opacity and occupied to be transparent
    if (state === `new-user`) {
      // if taken = false
      if (!this.taken) {
        // full opacity
        this.tint.alpha = 255;
      } else {
        // if taken = true
        // transparent
        this.tint.alpha = 95;
      }
    }
    // Else if pod-navigation, occupied is full opacity and unoccupied is transparent
    else if (state === `pod-navigation`) {
      // if taken = false
      if (!this.taken) {
        // transparent
        this.tint.alpha = 95;
      } else {
        // if taken = true
        // full opacity
        this.tint.alpha = 255;
      }
    }

    tint(this.tint.r, this.tint.g, this.tint.b, this.tint.alpha);
    translate(this.x, this.y);
    scale(this.scale);
    image(this.podImage, 0, 0);

    pop();
  }

  // set user pod tint to magenta
  setUserPodTint() {
    this.tint.r = 241;
    this.tint.g = 47;
    this.tint.b = 101;
  }

  // Check if mouse overlaps pod
  overlap() {
    if (
      mouseX > this.x - (this.podImage.width * this.scale) / 2 &&
      mouseX < this.x + (this.podImage.width * this.scale) / 2 &&
      mouseY > this.y - (this.podImage.height * this.scale) / 2 &&
      mouseY < this.y + (this.podImage.height * this.scale) / 2
    ) {
      cursor("pointer");
      return true;
    } else {
      return false;
    }
  }

  // let new user select an unoccupied pod
  chooseNewPod(userInfo) {
    // If pod has not been taken, make this the new home
    if (!this.taken) {
      console.log(`new home`);
      // assign this pod to new user:

      // update narration text:
      narrationText = "Welcome, this is your new home!";
      // update greenhouse data's taken property
      clientSocket.emit("updateTakenGreenhouse", {
        userInfo: userInfo,
        x: this.x,
        y: this.y,
      });

      // Request the user greenhouse positions to be found
      // clientSocket.emit("getUserPodPositions");

      // change tint color to magenta
      this.setUserPodTint();

      // cue fade in/out transition
      cueRectangleTransition();

      // wait 5 seconds to cue next state
      // fyi when using setInterval inside a class, we need to add ".bind(this)" to end of function
      setTimeout(this.changeStateToPodNavigation.bind(this), 3000);
    } else {
      alert(`sorry, pod is taken already`);
    }
  }

  // change state from `new-user` to `pod-navigation`
  changeStateToPodNavigation() {
    // make new user pod taken
    this.taken = true;

    // change state
    state = `pod-navigation`;
  }

  mousePressed(userInfo) {
    // if mouse touches pod image
    if (this.overlap()) {
      if (state === `new-user`) {
        // let user choose a new pod
        this.chooseNewPod(userInfo);
      }
      // else if inside taken greenhouse
      else if (state === `pod-navigation` && this.taken) {
        // console.log(`clicking`);

        // Request the user greenhouse positions to be found
        clientSocket.emit("getUserPodPositions");

        // get the visit pod's data: user info, plant info, pod info
        clientSocket.emit("getAllVisitPodData", {
          x: this.x,
          y: this.y,
        });

        // inside pod state
        state = `inside-pod`;

        // resize canvas to windowWidth and windowHeight on click
        resizeCanvas(this.newCanvasWidth, this.newCanvasHeight);
      }
      // if inside empty greenhouse
      else if (state === `pod-navigation` && !this.taken) {
        console.log("no one lives here");
      } // if pod-navigation
    } // if overlap
  }
}
