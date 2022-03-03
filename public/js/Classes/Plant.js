class Plant {
  constructor(
    id,
    podBelongsToUser,
    plantImages,
    growthStage,
    numMessagesNeededToGrow,
    messages,
    position
  ) {
    this.id = id;

    // for setting the correct hover instructions: contains a boolean
    this.podBelongsToUser = podBelongsToUser;
    // contians instructions when hovering over plant
    this.hoverInstructions = undefined;

    // for rotation
    this.angle = 0;
    this.rotationSpeed = random(0.002, 0.005);
    this.maxAngle = 0.05;

    this.x = position.x;
    this.y = position.y;
    this.scale = 0.5;
    this.aqua = {
      r: 45,
      g: 227,
      b: 240,
    };
    this.font = `quicksand,sans-serif`;

    this.plantImages = plantImages;
    this.growthStage = growthStage;
    this.numMessagesNeededToGrow = numMessagesNeededToGrow;

    // to add to constructor
    this.messages = messages;
    this.readState = true;

    this.imageWidth = this.plantImages[this.growthStage].width / 2;
    this.imageHeight = this.plantImages[this.growthStage].height / 2;
    this.messageIndex = 0;
  }

  // update all behaviour of plant
  update() {
    // display the plant
    this.display();

    // if mouse hovering over plant, show instructions
    if (this.overlap()) {
      console.log(`showing hover instructions`);
      this.showHoverInstructions();
    }
  }

  // show instructions to send message when hovering over a plant
  showHoverInstructions() {
    if (this.podBelongsToUser) {
      if (this.messages.length > 0) {
        this.hoverInstructions = `Your plant is eager to say something.
  Click on it.`;
      } else {
        this.hoverInstructions = ``;
      }
    }
    // Else, if pod does not belong to user
    else {
      this.hoverInstructions = `Click on this plant to
send a message to it!`;
    }

    push();
    fill(aqua.r, aqua.g, aqua.b);
    textFont(font);
    textAlign(CENTER);
    text(this.hoverInstructions, this.x, this.y - 110);
    pop();
  }

  display() {
    push();
    imageMode(CENTER);

    // shake and change color
    if (this.messages.length > 0) {
      tint(255, 240, 0);
      translate(random(-2, 2), random(-2, 2));
    } else {
      // if (this.angle > this.maxAngle) {
      //   this.rotationSpeed *= -1;
      // }
      // this.angle += this.rotationSpeed;
      // rotate(this.angle);
    }

    translate(this.x, this.y);
    if (this.angle > this.maxAngle || this.angle < -this.maxAngle) {
      this.rotationSpeed *= -1;
    }
    this.angle += this.rotationSpeed;
    rotate(this.angle);
    scale(this.scale);
    image(this.plantImages[this.growthStage], 0, 0);

    pop();
  }

  overlap() {
    if (
      mouseX > this.x - this.imageWidth &&
      mouseX < this.x + this.imageWidth &&
      mouseY > this.y - this.imageHeight &&
      mouseY < this.y + this.imageHeight
    ) {
      return true;
    } else {
      return false;
    }
  }

  mousePressed() {
    if (modalSeedOpen === false) {
      if (this.overlap()) {
        // // get the visit plant's data
        // clientSocket.emit("getAllPlantData", {
        //   x: this.x,
        //   y: this.y,
        // });

        // if you are in your pod
        if (userPodX === visitPodData.x && userPodY == visitPodData.y) {
          console.log(`working`);
          console.log(this.messages);

          // if message has not been read, display message received on click
          if (this.messages.length > 0) {
            // if (this.messages[0])

            console.log(`you got messages`);
            document.getElementById("receivedMessageForm").style.display =
              "block";

            document.getElementById("senderName").innerHTML =
              "Sent by : " + this.messages[0].senderUsername;

            document.getElementById(
              "messageReceived"
            ).innerHTML = this.messages[0].message;
          }
        }
        // else, if you're in someone else's pod, you can only send messages
        else {
          console.log(`cannot see messages in someone else's pod`);
          // if message has been read, display send message form
          document.getElementById("messageFormHeader").innerHTML =
            "Send a message to " + visitUserData.username;
          document.getElementById("MessagingForm").style.display = "block";
        }
      }
    }
  }
}
