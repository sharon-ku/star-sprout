// NEW::: create a separate file for Message ...

const mongoose = require("mongoose");

//6: Define a schema (DB structure)
let Schema = mongoose.Schema;

//Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

let messageSchema = new Schema({
  //NEW ::: expand on Fruit infro to ALSO save info about user that created it....
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiverUsername: String,
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  senderUsername: String,
  plantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant",
  },
  readState: Boolean,
  message: String,
});

//7: create a model
//Compile model from schema (model we need to use)
let Message = mongoose.model("Message", messageSchema);

module.exports = Message;
