const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./routers/user");
const bookRouter = require("./routers/book");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.options("*", cors());
app.use(userRouter);
app.use(bookRouter);

app.use("/", (req, res) => {
  res.send('<h1 style="text-align:center">Welcome to book directory</h1>');
});
app.use("/*", (req, res) => {
  res.status(404).send({ error: "page not found" });
});

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (res, err) => {
    app.listen(port);
    console.log("connected " + port);
  }
);
