// NEW::: create a seperate file for Fruit ...

/*In stark contrast to the conventions of relational databases,
references are now stored in both documents:
the fruit references the user who created it,
and the user has an array of references to all of the fruit created by them.*/

const mongoose = require("mongoose");

//6: Define a schema (DB structure)
let Schema = mongoose.Schema;

//Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

let greenhouseSchema = new Schema({
  x: Number,
  y: Number,
  taken: Boolean,
});

//7: create a model
//Compile model from schema (model we need to use)
let Greenhouse = mongoose.model("Greenhouse", greenhouseSchema);

module.exports = Greenhouse;
