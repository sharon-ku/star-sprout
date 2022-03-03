// NEW::: create a seperate file for Plant ...

const mongoose = require("mongoose");

//6: Define a schema (DB structure)
let Schema = mongoose.Schema;

//Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

// // original fruits example
// let testFruitSchema = new Schema({
//   fruit_name: String,
//   fruit_description: String,
//   like_rating:Number,
//   //NEW ::: expand on Fruit infro to ALSO save info about user that created it....
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//      ref: 'User'
//     }
// });
let plantSchema = new Schema({
  //NEW ::: expand on Fruit infro to ALSO save info about user that created it....
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  growthStage: Number,
  numMessagesNeededToGrow: Number,
  position: {
    x: Number,
    y: Number,
  },
});

//7: create a model
//Compile model from schema (model we need to use)
let Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;
