require("dotenv").config();
const express = require("express");
const app = express();

// Setup your Middleware and API Router here
const morgan = require("morgan");
const bodyParser = require("body-parser");

app.use(morgan("dev"));

const cors = require("cors");
app.use(cors());

app.use(bodyParser.json());

const apiRouter = require("./api");
app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).send({ message: "Content Not Found" });
});

module.exports = app;