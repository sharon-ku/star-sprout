/**
script.js
Sharon Ku & Leanne Suen Fa

All our p5 stuff
Linked to greenhouses.html
*/

"use strict";

// To allow client to connect to socket
let clientSocket;
let socketId = -1;
let running = false;

// Stores user info from DB
let userInfo = undefined;

// User's pod positions
let userPodX = undefined;
let userPodY = undefined;

// Store all of user's messages
let userMessagesReceived = [];

// Message displayed upon entering a pod
let welcomeMessageString = `Welcome Home!`;

// stores data related to pod we're visiting
let visitPodData = {
  // id
  _id: undefined,
  // visitor pod coordinates
  x: undefined,
  y: undefined,
};

// stores all data on user we're visiting
let visitUserData = {
  _id: undefined,
  username: undefined,
  podId: [],
};

// stores all data on plants inside visiting pod
let visitPlantsData = [];

// stores all plants in current visited pod
let visitGarden = [];

// stores the id of plant who has a "send message" modal opened
let currentSendMessagePlant = undefined;

// stores which plant has been clicked on to open message
let currentPlantClicked = undefined;

let bkg;
let canvasWidth = 3000;

// All possible states:
// new-user, pod-navigation, inside-pod, plant-view
// let state = `pod-navigation`;
let state = undefined;

// state when inside pod: booleancan either be `visiting` or `home`
let podBelongsToUser = undefined;

let teal = {
  r: 8,
  g: 116,
  b: 123,
};

let aqua = {
  r: 45,
  g: 227,
  b: 240,
};

// narrative string
// this first string will appear in new-user state
let narrationText = "Choose a pod that will be your new home";

let stars = [];
const NUM_STARS = 100;

// text properties
let font = `quicksand, sans-serif`;

let pods = [];
let podImages = []; //array to store pod images
let numPodImages = 4; //number pod podImages
const NUM_POD_IMG = 4;
const NUM_PODS = 100;

const NUM_PLANT_IMG = 4;
let cactusImages = [];
let dragonImages = [];
let cherryImages = [];

// icon
// home icon
let homeIconImg;
let homeIcon;

// butterfly icon
let butterflyIconImg;
let butterflyIcon;

// teleport icon
let teleportIconImg;
let teleportIcon;

// seed icon
let seedIconImg;
let seedIcon;

// rectangle that fades in and out between states
let rectangleTransition;

// bkg Music
let bkgMusic;

// prevent 2 modal windows from opening at the same time
let modalSeedOpen = false;

// close modal windows
$("#closeMessageForm").click(function () {
  $("#MessagingForm").toggle();
  document.getElementById(`messageForm`).reset();
});
$("#closeSeedForm").click(function () {
  $("#SeedForm").toggle();
  modalSeedOpen = false;
});
$("#closeReceivedMessageForm").click(function () {
  $("#receivedMessageForm").toggle();

  // set message readStatus to true
  clientSocket.emit(`updateMessageReadStatus`, currentPlantClicked);

  // reset message box when modal is closed
  // $("#messageBody").empty();
});

function preload() {
  // load pod images
  for (let i = 0; i < NUM_POD_IMG; i++) {
    let loadPodImage = loadImage(`assets/images/pods/pod${i}.png`);
    podImages.push(loadPodImage);
  }

  // cactus images
  for (let i = 0; i < NUM_PLANT_IMG; i++) {
    let plantImage = loadImage(`assets/images/plants/cactus${i}.png`);
    cactusImages.push(plantImage);
  }

  // cherry images
  for (let i = 0; i < NUM_PLANT_IMG; i++) {
    let plantImage = loadImage(`assets/images/plants/cherry${i}.png`);
    cherryImages.push(plantImage);
  }

  // dragon images
  for (let i = 0; i < NUM_PLANT_IMG; i++) {
    let plantImage = loadImage(`assets/images/plants/dragon${i}.png`);
    dragonImages.push(plantImage);
  }

  // load home icon image
  homeIconImg = loadImage(`assets/images/icons/greenhouse-icon.png`);

  // load butterfly icon image
  butterflyIconImg = loadImage(`assets/images/icons/butterfly-icon.png`);

  // load teleport icon image
  teleportIconImg = loadImage(`assets/images/icons/teleport-icon.png`);

  // load seed icon image
  seedIconImg = loadImage(`assets/images/icons/seed_icon.png`);

  // load background Music
  bkgMusic = loadSound(`assets/music/Sugar_Cookie/sugar_cookie.mp3`);
}

/* ----------------------------------------
setup()
-----------------------------------------*/
function setup() {
  bkg = createCanvas(canvasWidth, canvasWidth);
  bkg.position(0, 0);
  bkg.style("z-index", -1);

  // If you come to greenhouse page but user did not come from correct route, go back to login page
  if (localStorage.getItem("user") === null) {
    window.location = "index.html";
  } else {
    // grab user data from local storage and store it in userInfo variable
    userInfo = JSON.parse(localStorage.getItem(`user`))[0];
    console.log(userInfo);
    // now delete user data from local storage
    localStorage.removeItem(`user`);

    // FOR WORKING WEBSITE, UNCOMMENT THIS:
    clientSocket = io();

    // // FOR TESTS, UNCOMMENT THIS;
    // clientSocket = io.connect("http://localhost:3000");

    clientSocket.on("connect", function (data) {
      console.log("connected");
      // put code here that should only execute once the client is connected
      /*********************************************************************************************/
      // NEW:: pass the userID from db so server can CONNECT the userID and socket id together ... */
      /********************************************************************************************/
      clientSocket.emit("join", userInfo);
      // handler for receiving client id
      clientSocket.on("joinedClientId", function (data) {
        // socketId = data;
        // console.log("myId " + socketId);
        console.log(data);

        clientSocket.emit("requestGreenhouses");

        // only start draw once running is true
        running = true;
      });
    });

    // display greenhouses from database
    clientSocket.on("newGreenhouses", function (results) {
      // create pods
      for (let i = 0; i < results.length; i++) {
        // keep some distance from borders

        let x = results[i].x;
        let y = results[i].y;
        let image = random(podImages);
        let taken = results[i].taken;

        // resize canvas to windowWidth and windowHeight
        let pod = new Greenhouse(x, y, image, windowWidth, windowHeight, taken);
        pods.push(pod);
      }

      // Request the user greenhouse positions to be found
      clientSocket.emit("getUserPodPositions");
    });

    // Once the user's pod has been found, change its tint
    clientSocket.on("foundUserGreenhousePositions", function (result) {
      userPodX = result.x;
      userPodY = result.y;

      console.log(`user pod positions: ${userPodX}, ${userPodY}`);

      // change tint color of user greenhouse
      for (let i = 0; i < pods.length; i++) {
        let pod = pods[i];

        // if this is the user's greenhouse
        if (pod.x === userPodX && pod.y === userPodY) {
          pod.setUserPodTint();
          // set pod's taken value to true
          pod.taken = true;
        }
      }
    });

    // get visiting pod coordinates
    clientSocket.on("foundPodVisited", function (result) {
      visitPodData.x = result.x;
      visitPodData.y = result.y;
    });

    // create icons
    let iconSize = windowWidth / 15;
    let homeIconSize = iconSize - 20;

    let iconX_R = windowWidth * 0.01;

    // add home icon
    homeIcon = new HomeIcon(
      iconX_R,
      iconX_R,
      homeIconImg,
      homeIconSize,
      canvasWidth,
      canvasWidth
    );

    let iconX_L = windowWidth - iconSize * 1.1 - 30;
    let iconY_L = windowHeight * 0.02;

    let seedIcon_Y = iconX_R + iconSize * 1.4;
    seedIcon = new SeedIcon(
      iconX_L,
      iconY_L,
      seedIconImg,
      iconSize,
      visitGarden.length
    );

    // Create sparkling stars!
    for (let i = 0; i < NUM_STARS; i++) {
      let star = new Star();
      stars.push(star);
    }

    // Create rectangle transition
    rectangleTransition = new RectangleTransition();

    // Get pod positions again ONLY once the pod was added for the new user
    clientSocket.on("addedGreenhouseForNewUser", function (result) {
      clientSocket.emit("getUserPodPositions");
    });

    // display greenhouses from database
    clientSocket.on("spliceMessage", function (plantId) {
      console.log(`splicing`);
      // remove first message of that plant
      for (let i = 0; i < visitGarden.length; i++) {
        let plant = visitGarden[i];
        console.log(`visitGarden` + visitGarden[i]);
        console.log(`plant` + plant.id);
        if (plant.id === plantId) {
          console.log(`splice the first message`);
          // splice the first message
          plant.messages.splice(0, 1);
          console.log(`plantmessages` + plant.messages);
        }
      }
    });

    // display user visited from database
    clientSocket.on("foundUserVisited", function (result) {
      visitUserData = result;
      console.log(`currently visiting:` + visitUserData.username);

      // display welcome home message
      welcomeMessageString = `Welcome to ${visitUserData.username}'s pod!`;
    });

    // if user messages found, store array of messages
    clientSocket.on("foundUserMessages", function (messageResults) {
      // store messages in userMessagesReceived
      userMessagesReceived = messageResults;
      console.log(`messages:` + messageResults);

      // set this to true so that we can create plants with this info
      podBelongsToUser = true;

      // create p5 plants by passing messages into it
      createP5Plants();
    });

    // display plants from database
    clientSocket.on("foundPlants", function (results) {
      // reset visit plants data to grab new plants
      visitPlantsData = [];
      visitGarden = [];

      for (let i = 0; i < results.length; i++) {
        // console.log(results[i]);

        // Store all plant results inside visitPlantsData array
        visitPlantsData.push(results[i]);
      }

      // If it's not user's pod, create p5 plants
      if (userPodX != visitPodData.x && userPodY != visitPodData.y) {
        // you cannot view other people's messages
        userMessagesReceived = 0;

        // set this to false so that we can create plants with this info
        podBelongsToUser = false;

        // create p5 plants by passing messages into it
        createP5Plants();
      }

      // if this is the user's pod:
      if (userPodX === visitPodData.x && userPodY == visitPodData.y) {
        // check if there are messages
        console.log(`this is user's house`);
        clientSocket.emit("getUserMessages");

        // console.log(`getting user message`);
      }
    }); // client socket

    // Check if user is new using their pod id value:
    if (userInfo.podId.length === 0) {
      // user does not have a pod
      console.log(`no greenhouse`);
      state = `new-user`;
    } else {
      // user already has a greenhouse
      console.log(`yes greenhouse`);
      state = `pod-navigation`;
    }
  } // not null
} // end setup

function createP5Plants() {
  // console.log(`creating a plant`);

  // console.log(visitPlantsData);
  for (let i = 0; i < visitPlantsData.length; i++) {
    console.log(`usermessagesrece` + userMessagesReceived[0]);

    // store plant messages inside here
    let thisPlantMessages = [];

    for (let j = 0; j < userMessagesReceived.length; j++) {
      console.log(`id platn` + visitPlantsData[i]._id);
      if (userMessagesReceived[j].plantId === visitPlantsData[i]._id) {
        let thisPlantMessage = userMessagesReceived[j];

        thisPlantMessages.push(thisPlantMessage);
        // console.log(userMessagesReceived[j].message);
        // console.log(userMessagesReceived[j].plantId);

        console.log(thisPlantMessage);
      }
    }

    let plant = {
      id: visitPlantsData[i]._id,
      name: visitPlantsData[i].name,
      images: undefined,
      growthStage: visitPlantsData[i].growthStage,
      numMessagesNeededToGrow: visitPlantsData[i].numMessagesNeededToGrow,
      messages: thisPlantMessages,
      position: {
        x: visitPlantsData[i].position.x,
        y: visitPlantsData[i].position.y,
      },
    };

    // set images based on plant type
    if (plant.name === "cherry") {
      plant.images = cherryImages;
    } else if (plant.name === "dragon") {
      plant.images = dragonImages;
    } else if (plant.name === "cactus") {
      plant.images = cactusImages;
    }

    // create a new plant
    let newPlant = new Plant(
      plant.id,
      podBelongsToUser,
      plant.images,
      plant.growthStage,
      plant.numMessagesNeededToGrow,
      plant.messages,
      plant.position
    );
    // console.log(newPlant);
    // add this plant to visitGarden
    visitGarden.push(newPlant);
    // console.log(visitGarden);
  }
}

/* ----------------------------------------
draw()
-----------------------------------------*/
function draw() {
  if (running) {
    // background(teal.r, teal.g, teal.b);
    background(31, 80, 80);

    // music();
    // States setup:
    if (state === `new-user`) {
      newUser();
    } else if (state === `pod-navigation`) {
      podNavigation();
    } else if (state === `inside-pod`) {
      resizeCanvas(windowWidth, windowHeight);
      insidePod();
    }
  }
}

// Allow user to select a new greenhouse and cue intro story
function newUser() {
  // background(31, 80, 80);
  background(0);

  // draw stars
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    star.update();
  }

  for (let i = 0; i < pods.length; i++) {
    let pod = pods[i];
    pod.update();
  }

  push();
  textSize(25);
  textAlign(CENTER);
  textFont(font);
  fill(aqua.r, aqua.g, aqua.b);
  text(narrationText, windowWidth / 2, windowHeight / 2);
  pop();
}

function podNavigation() {
  background(31, 80, 80);

  // draw stars
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    star.update();
  }

  for (let i = 0; i < pods.length; i++) {
    let pod = pods[i];
    pod.update();
  }
}

// cue fade in/out transition
function cueRectangleTransition() {
  rectangleTransition.update();
}

function insidePod() {
  background(31, 80, 80);

  // draw stars
  for (let i = 0; i < stars.length; i++) {
    let star = stars[i];
    star.update();
  }

  // if at home
  if (userPodX === visitPodData.x && userPodY == visitPodData.y) {
    homeIcon.display();
    homeIcon.overlap();

    // display welcome home message
    welcomeMessageString = `Welcome Home, ${userInfo.username}!`;
  } else {
    homeIcon.display();
    homeIcon.overlap();

    seedIcon.display();
    seedIcon.overlap();
  }

  // display garden
  for (let i = 0; i < visitGarden.length; i++) {
    let plant = visitGarden[i];
    plant.update();
  }

  // Display welcome message
  displayWelcomeMessage(welcomeMessageString);
}

// Display welcome message when entering a pod
function displayWelcomeMessage(messageString) {
  push();
  textSize(24);
  textFont(font);
  fill(aqua.r, aqua.g, aqua.b);
  text(messageString, windowWidth * 0.025, windowHeight * 0.95);
  pop();
}

function mousePressed() {
  for (let i = 0; i < pods.length; i++) {
    let pod = pods[i];
    pod.mousePressed(userInfo);
  }

  if (state === `inside-pod`) {
    homeIcon.mousePressed();

    seedIcon.mousePressed();

    for (let i = 0; i < visitGarden.length; i++) {
      let plant = visitGarden[i];
      plant.mousePressed();

      if (plant.overlap()) {
        currentPlantClicked = visitPlantsData[i];
        // console.log(`currentplantclicked` + currentPlantClicked.name);
        // console.log(currentPlantClicked._id);
      }

      // Store currentSendMessagePlant info so we can find this plant in DB
      currentSendMessagePlant = visitPlantsData[i];
    }
  }
}

function windowResized() {
  console.log(`resized`);
  if (state === `inside-pod`) {
    resizeCanvas(windowWidth, windowHeight);
  }
}

//Loop background music
function music() {
  if (!bkgMusic.isPlaying()) {
    bkgMusic.loop();
  }
}

// submit message
$("#submitMsg").click(function () {
  event.preventDefault();
  let closeMessageForm = new FormData($("#messageForm")[0]);

  let message = {};

  // Display the key/value pairs
  for (var pair of closeMessageForm.entries()) {
    console.log(pair[0] + ", " + pair[1]);
    message[pair[0]] = pair[1];
  }

  console.log(message);

  console.log(`current message` + currentSendMessagePlant);

  clientSocket.emit(`sendMessage`, {
    message: message,
    plant: currentSendMessagePlant,
  });

  // deletes text in search bar
  document.getElementById(`messageForm`).reset();
  // $("#messageBox").empty();
});

// submit seed choice
$("#submitSeedChoice").click(function () {
  event.preventDefault();
  let closeMessageForm = new FormData($("#selectSeed")[0]);

  let seed = {};

  // Display the key/value pairs
  for (var pair of closeMessageForm.entries()) {
    console.log(pair[0] + ", " + pair[1]);
    seed[pair[0]] = pair[1];
  }
  let seedX = 300 + Math.floor(Math.random() * (windowWidth - 300));
  let seedY = 300 + Math.floor(Math.random() * (windowHeight - 300));

  console.log(seed);

  clientSocket.emit(`selectSeed`, {
    seed: seed,
    visitUser: visitUserData,
    seedX: seedX,
    seedY: seedY,
  });

  clientSocket.emit("getAllVisitPodData", {
    x: visitPodData.x,
    y: visitPodData.y,
  });

  document.getElementById(`selectSeed`).reset();
});
