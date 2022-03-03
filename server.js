/****************************************
MongoDB set up
*****************************************/

// for parsing
let bodyParser = require("body-parser");

//new get user module
const User = require("./user");

// new greenhouse module
const Greenhouse = require("./greenhouse");

// new plant module
const Plant = require("./plants");

// new message module
const Message = require("./message");

//5: add the connection code:
const mongoose = require("mongoose");

// if (process.argv.length < 3) {
//   console.log(
//     "Please provide the password as an argument: node mongo.js <password>"
//   );
//   process.exit(1);
// }

// const password = process.argv[2];
const password = `the_egg`;

//good idea to put in the password when running from the terminal (for testing and PLEASE do not share :: (mine is XML2asp))
//database name is myFirstDatabase (creates)

// const url = `mongodb+srv://sab-comp:${password}@cluster0.7p8bo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const url = `mongodb+srv://ben:${password}@cluster0.kdjyl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

mongoose.connect(url);
let db = mongoose.connection;

//bind to error event
//Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

/****************************************
Node set up
*****************************************/

let express = require("express");
// // port number if we want to do tests:
// const portNumber = 3000;
// Heroku's port number
const portNumber = process.env.PORT || 5000;
let app = express(); //make an insatnce of express
let httpServer = require("http").createServer(app);
// create a server (using the Express framework object)
// declare io which mounts to our httpServer object (runs on top ... )
let io = require("socket.io")(httpServer);
// serving static files
let static = require("node-static"); // for serving static files (i.e. css,js,html...)

let clientIdIncrementing = 0;
let clientIds = [];

//https://www.npmjs.com/package/body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//default route
app.get("/", function (req, res) {
  res.send("<h1>Hello world</h1>");
});

// new when user posts data register

app.post("/registerIn", async (request, response) => {
  const body = request.body;
  console.log(body);
  const saltRounds = 10;
  // const passwordHash = await bcrypt.hash(body.password, saltRounds);

  //is user already in?
  User.find({ username: body.username }).then((result) => {
    //result.forEach(fruit => {
    // console.log(fruit)
    console.log(result);

    if (result.length == 0) {
      //response.json("no user");

      const user = new User({
        username: body.username,
        // name: body.name,
        passwordHash: body.password,
      });
      //save to db
      user.save().then((result) => {
        response.json(result);
      });
    } //not in
    else {
      response.json("ALREADY IN");
    }
    //find
  });
  //done
});

//when user posts data -logIn:
app.post("/logIn", async (request, response) => {
  const body = request.body;
  console.log(body);
  // for now just do opposite of register ... do not worry about testing for password
  //is user already in?
  User.find({ username: body.username }).then((result) => {
    if (result.length == 1) {
      response.json(result);
    } else {
      response.json("WRONG INFO");
    }
  });
});

//for user register page
app.get("/userRegister", function (req, res) {
  response.sendFile(__dirname + "/public/newUser.html");
});

//for user login page
app.get("/userLogin", function (req, res) {
  response.sendFile(__dirname + "/public/index.html");
});

// make server listen for incoming messages
httpServer.listen(portNumber, function () {
  console.log("listening on port:: " + portNumber);
});

/*** THIS ONLY HAPPENS ONCE A CLIENT HAS SUCCESSFULLY LOGGED IN *****/
io.on("connect", newConnection);

function newConnection(socket) {
  let userDB = null;

  console.log(socket);
  console.log(`new connection: ` + socket.id);

  socket.on("join", function (data) {
    socket.emit("joinedClientId", "temp");
    console.log(data);
    userDB = data;
  });

  // request Greenhouses from MongoDB into server
  socket.on("requestGreenhouses", function (data) {
    Greenhouse.find({}).then((result) => {
      result.forEach((greenhouse) => {
        // console.log(greenhouse);
      });
      socket.emit("newGreenhouses", result);
    });
  });

  // update Greenhouse's taken value in MongoDB
  socket.on("updateTakenGreenhouse", function (data) {
    let tempUser = data.userInfo;
    let x = data.x;
    let y = data.y;
    console.log(userDB);
    Greenhouse.updateOne({ x: x, y: y }, { taken: true }).then((result) => {
      console.log(`greenhouse updated`);
      console.log(x, y);
      console.log(result);

      Greenhouse.findOne({ x: x, y: y }).then((result) => {
        console.log(`hello new`);
        // console.log(result[0].toJSON());
        console.log(tempUser);
        console.log(tempUser.username);

        User.findOne({ username: tempUser.username }).then((resultUser) => {
          resultUser.podId = resultUser.podId.concat(result._id);
          console.log(resultUser);

          resultUser.save().then((result) => {
            console.log("done");
          });
        });
      });
    });

    console.log("hello");
    console.log(userDB);
  }); // update taken greenhouse

  socket.on("getUserPodPositions", function () {
    User.findOne({ username: userDB.username }).then((userResult) => {
      Greenhouse.findOne({ _id: userResult.podId[0] }).then(
        (greenhouseResult) => {
          socket.emit("foundUserGreenhousePositions", greenhouseResult);
        }
      ); // greenhouse find one
    }); // user find one
  }); // socket on

  // get the visit pod's data: user info and pod info
  socket.on("getAllVisitPodData", function (data) {
    let x = data.x;
    let y = data.y;
    console.log(data);
    console.log(`checking visit pod data`);

    // Find pod data
    Greenhouse.findOne({ x: x, y: y }).then((visitPodResult) => {
      socket.emit("foundPodVisited", visitPodResult);

      // Find user data who lives in pod
      User.findOne({ podId: visitPodResult._id }).then((visitUserResult) => {
        socket.emit("foundUserVisited", visitUserResult);

        // Find plant data that has user id
        Plant.find({ userId: visitUserResult._id }).then((plantResults) => {
          socket.emit("foundPlants", plantResults);
          // console.log(plantResults);
        }); // plant find
      }); // user find one
    }); //greenhouse find one
  }); //socket on

  // send messages to database
  socket.on("sendMessage", function (data) {
    let messageToSend = data.message;
    let plant = data.plant;
    console.log(`plant` + data);

    // find all plant data
    Plant.findOne({ _id: plant._id }).then((plantResult) => {
      // find user data
      User.findOne({ _id: plantResult.userId }).then((userResult) => {
        // create a new message entry in database
        const message = new Message({
          receiverId: userResult._id,
          receiverUsername: userResult.username,
          senderId: userDB.id,
          senderUsername: userDB.username,
          plantId: plantResult._id,
          readState: false,
          message: messageToSend.message,
        });

        // save to database
        message.save().then((result) => {});
      }); //user findOne
    }); //plant findOne
  }); //socket on sendMessage

  // update message readState
  socket.on("updateMessageReadStatus", function (data) {
    let plantId = data._id;
    console.log(plantId);

    Message.updateOne(
      { plantId: plantId, readState: false },
      { readState: true }
    ).then((result) => {
      console.log(`message state updated`);
      socket.emit("spliceMessage", plantId);
    }); // message update one
  }); //socket on sendMessage

  // grab all messages belonging to the user
  socket.on("getUserMessages", function () {
    Message.find({ receiverId: userDB.id, readState: false }).then(
      (messageResults) => {
        console.log(messageResults);
        socket.emit("foundUserMessages", messageResults);
      }
    ); // message find
  }); // socket on

  // get seed choice
  socket.on("selectSeed", function (data) {
    let seedChosen = data.seed.seed;
    let visitUser = data.visitUser;
    // console.log(data);
    // console.log("seedChosen " + seedChosen);
    // console.log("visitUser : " + visitUser.username);

    let counter = 0;

    User.findOne({ username: visitUser.username }).then((seedRecipient) => {
      // User.findById(visitUser.id).then((seedRecipient) => {
      let randomGrowthStage = Math.floor(Math.random() * 4);
      // console.log("seedRecipient" + seedRecipient);

      const addSeed = new Plant({
        userId: seedRecipient._id,
        name: seedChosen,
        growthStage: randomGrowthStage,
        numMessagesNeededToGrow: 2,
        position: {
          x: data.seedX,
          y: data.seedY,
        },
      }); //addSeed

      // save to database
      addSeed.save().then((result) => {});
    }); //user findone
  }); // socket on select seed

  // get the visit plant's data
  socket.on("getAllPlantData", function (data) {
    let x = data.x;
    let y = data.y;
    console.log("getAllPlantData : " + data);

    Plant.findOne({ x: x, y: y }).then((plantClicked) => {
      console.log("this was clicked" + plantClicked);
      Message.find({ plantId: plantClicked._id }).then((message) => {
        // console.log("All messages in same plant" + message);
      });
    });
  }); //socket on getallplantdata
} //io.on

// serve anything from this dir ...
app.use(express.static(__dirname + "/public"));
// for the client...
app.use(express.static(__dirname + "/node_modules"));

//make a route
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
