const express = require("express");
const multer = require("multer");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const isAuth = require("../is-Auth");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.originalname.split(".")[0]}-${Date.now()}.${
        file.originalname.split(".")[1]
      }`
    );
  },
});

const upload = multer({
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }
    cb(undefined, true);
  },
  storage,
});

router.get("/profile", isAuth, async (req, res) => {
  res.send(req.user);
});

router.post(
  "/signup",
  upload.single("profilePhoto"),
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 characters long"),
    body("email").isEmail().withMessage("email is invalid"),
    body(
      "password",
      "password should be only text and numbers and at least 5 characters long"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array()[0].msg });
    }
    let photo;
    try {
      const emailMatch = await User.findOne({ email: req.body.email });
      if (emailMatch)
        return res
          .status(400)
          .send({ error: "email already in use try another one" });

      req.file ? (photo = req.file.path) : (photo = null);

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        profilePhoto: photo,
        books: [],
      });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      user.tokens = user.tokens.concat({ token });
      await user.save();
      res.status(201).send({ token });
    } catch (err) {
      console.log(err);
      res.status(422).send({ error: err });
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().trim().withMessage("email is invalid"),
    body("password", "Password has to be valid.")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).send({ errors: errors.array()[0].msg });

    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(422).send({ error: "user not found" });

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) return res.status(422).send({ error: "password is invalid" });

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      user.tokens = user.tokens.concat({ token });
      await user.save();
      res.send({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.post("/logout", isAuth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send({ success: "logged out" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch(
  "/update-user/:id",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("name should be atleast 3 characters long")
      .optional({ nullable: true }),
    body("email")
      .isEmail()
      .withMessage("email is invalid")
      .optional({ nullable: true }),
    body(
      "password",
      "password should be only text and numbers and atleast 6 characters long"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .optional({ nullable: true }),
  ],
  isAuth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).send({ errors: errors.array()[0].msg });

    try {
      if (req.user._id.toString() !== req.params.id)
        return res.status(401).send({ error: "Please authintcate!" });

      const userId = req.params.id;
      if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        updatedPass = hashedPassword;
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).send({ error: "no user found" });

      req.body.name ? (user.name = req.body.name) : (user.name = user.name);
      req.body.email
        ? (user.email = req.body.email)
        : (user.email = user.email);
      req.body.password
        ? (user.password = updatedPass)
        : (user.password = user.password);

      await user.save();
      console.log("updated");
      res.send({ result: user });
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  }
);

router.delete("/delete-profile", isAuth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ "Deleted user": req.user });
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post(
  "/profile-photo",
  isAuth,
  upload.single("profilePhoto"),
  async (req, res) => {
    if (!req.file)
      return res.status(400).send({ error: "please upload a photo" });
    req.user.profilePhoto = req.file.buffer;
    await req.user.save();
    res.send(req.user);
  }
);

router.delete("/profile-photo", isAuth, async (req, res) => {
  req.user.profilePhoto = undefined;
  await req.user.save();
  res.send("profile photo deleted");
});

module.exports = router;
