//NEW

const mongoose = require("mongoose");

//The ids of the fruits are stored within the user document as an array of Mongo ids.
//The definition is as follows:

const userSchema = new mongoose.Schema({
  username: String,
  // name: String,
  passwordHash: String,
  podId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Greenhouse",
    },
  ],

  // fruits: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "Fruit",
  //   },
  // ],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
