const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minLength: 3,
    required: [true, "username is required"],
    unique: true,
  },
  name: String,
  passwordHash: {
    type: String,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, returnObject) => {
    returnObject.id = returnObject._id.toString();
    delete returnObject._id;
    delete returnObject.__v;
    delete returnObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
