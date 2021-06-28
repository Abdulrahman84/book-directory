const express = require("express");
const { body, validationResult } = require("express-validator");
const { upload, cloudinary } = require("../upload");
const Book = require("../models/book");
const User = require("../models/user");
const Rate = require("../models/rate");
const isAuth = require("../is-Auth");

const router = express.Router();

router.post(
  "/add-book",
  upload.single("image"),
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 charechters long"),
    body("description")
      .isLength({ min: 5 })
      .withMessage("description should be atleast 3 charechters long"),
  ],
  isAuth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array()[0].msg });
    }
    let photo;
    let cl_id;
    try {
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        photo = result.secure_url;
        cl_id = result.public_id;
      } else {
        photo = null;
        cl_id = null;
      }

      const book = new Book({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        image: photo,
        cloudinary_id: cl_id,
        authorId: req.user._id,
      });

      req.user.books.bookId.push(book._id);
      await req.user.save();

      await book.populate("authorId", "name").execPopulate();

      book.save(() => {
        res.status(201).send({ book });
      });
    } catch (err) {
      console.log(err);
      res.send({ error: err.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.post(
  "/rate-book/:id",
  [
    body("rating", "rate should be between 0 and 5").custom((value) => {
      if (value < 6) return new Error();
    }),
  ],
  isAuth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array()[0].msg });
    }

    const bookId = req.params.id;
    try {
      const book = await Book.findById(bookId);
      if (!book) return res.status(404).send({ error: "no book found" });

      const rate = await Rate.findOneAndUpdate(
        { ratedBook: bookId, rater: req.user._id },
        {
          rating: req.body.rating,
          rater: req.user._id,
          ratedBook: bookId,
        },
        {
          upsert: true,
          new: true,
        }
      );
      const ratesArray = await Rate.aggregate([
        {
          $group: {
            _id: "$ratedBook",
            avergeRate: { $avg: "$rating" },
          },
        },
      ]);
      const avgRate = ratesArray.find((document) => {
        return document._id.toString() === rate.ratedBook.toString();
      });
      book.rate = avgRate.avergeRate.toFixed(1);
      await book.save();

      res.status(201).send({ book });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.patch(
  "/update-book/:id",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 charechters long")
      .optional({ nullable: true }),
    body("description")
      .isLength({ min: 5 })
      .withMessage("description should be atleast 3 charechters long")
      .optional({ nullable: true }),
  ],
  isAuth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).send({ errors: errors.array()[0].msg });
    try {
      const bookId = req.params.id;
      const book = await Book.findById(bookId);

      if (!book) return res.status(404).send({ error: "no book found!" });
      if (req.user._id.toString() !== book.authorId.toString())
        return res.status(401).send({ error: "Please authintcate!" });

      req.body.name ? (book.name = req.body.name) : (book.name = book.name);
      req.body.type ? (book.type = req.body.type) : (book.type = book.type);
      req.body.description
        ? (book.description = req.body.description)
        : (book.description = book.description);
      await book.save();
      res.send({ message: "book updated successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.post(
  "/book-image/:id",
  isAuth,
  upload.single("image"),
  async (req, res) => {
    let photo;
    let cl_id;
    if (!req.file) {
      photo = null;
      cl_id = null;
      return res.status(400).send({ error: "please upload a photo" });
    }
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      photo = result.secure_url;
      cl_id = result.public_id;
    }
    const id = req.params.id;
    const book = await Book.findByIdAndUpdate(
      id,
      { image: photo, cloudinary_id: cl_id },
      { new: true }
    );
    if (!book) return res.status(404).send({ error: "no book found" });
    res.send({ message: "book image updated successfully", image: book.image });
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/delete-book/:id", isAuth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findByIdAndDelete(bookId);
    if (!book) return res.status(404).send("no book found");

    await cloudinary.uploader.destroy(book.cloudinary_id);

    const user = await User.findById(req.user._id);
    user.books.bookId = user.books.bookId.filter((book) => {
      return book.toString() !== bookId;
    });
    await user.save();
    res.send({ "Deleted book": book });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.get("/my-books", isAuth, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user._id }).populate(
      "books.bookId"
    );
    const booksArray = user.books.bookId;
    if (!booksArray.length) return res.send({ msg: "no books to display" });
    res.send(
      booksArray.map((book) => {
        return book;
      })
    );
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

// Public routes
router.get("/single-book/:id", async (req, res) => {
  const bookId = req.params.id;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).send({ error: "no book found" });

  await book.populate("authorId", "name -_id").execPopulate();

  res.send(book);
});

router.get("/all-books", async (req, res) => {
  try {
    const books = await Book.find()
      .populate("authorId", "name -_id")
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));

    res.send(books);
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/book-by-name", async (req, res) => {
  try {
    const bookName = req.query.bookName;
    if (!bookName)
      return res.status(400).send({ error: "please provide a book name" });

    const books = await Book.find({ $text: { $search: bookName } })
      .sort({ createdAt: 1 })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));
    if (!books.length)
      return res
        .status(404)
        .send({ error: "Sorry, no book matched your search" });
    res.send(books);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

router.get("/book-by-type", async (req, res) => {
  try {
    const type = req.query.type;
    if (!type) return res.send({ error: "please provide a type search" });
    const books = await Book.find({ $text: { $search: bookName } })
      .sort({ createdAt: 1 })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));
    if (!books.length)
      return res
        .status(404)
        .send({ error: "Sorry, no book matched your search" });
    res.send(books);
  } catch (err) {
    res.send(err);
  }
});

router.get("/book-by-rate", async (req, res) => {
  try {
    const rate = req.query.rate;
    if (!rate) return res.send({ error: "please provide a rate search" });
    const books = await Book.find({ rate: rate })
      .sort({ createdAt: 1 })
      .limit(parseInt(req.query.limit))
      .skip(parseInt(req.query.skip));
    if (!books.length)
      return res
        .status(404)
        .send({ error: "Sorry, no book matched your search" });
    res.send(books);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
