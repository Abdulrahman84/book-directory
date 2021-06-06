const mongoose = require("mongoose");
const validator = require("validator");

const Book = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    rate: {
      type: Number,
      default: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

Book.methods.toJSON = function () {
  const book = this;
  const bookObject = book.toObject();

  // delete bookObject.image;

  return bookObject;
};

module.exports = mongoose.model("Book", Book);
