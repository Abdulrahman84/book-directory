const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const userRouter = require("./routers/user");
const bookRouter = require("./routers/book");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, Content-Length, X-Requested-With"
//   );
//   next();
// });
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(userRouter);
app.use(bookRouter);

app.use("/home", (req, res) => {
  res.send('<h1 style="text-align:center">Welcome to book directory</h1>');
});
app.use("*", (req, res) => {
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
