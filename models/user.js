const mongoose = require("mongoose");
const Book = require("./book");

const Schema = mongoose.Schema;

const User = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  profilePhoto: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  books: {
    bookId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true,
      },
    ],
  },
});

User.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  // delete userObject.profilePhoto;

  return userObject;
};

User.pre("remove", async function (next) {
  const user = this;
  await Book.deleteMany({ authorId: user._id });
  next();
});

module.exports = mongoose.model("User", User);
