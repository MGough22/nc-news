const express = require("express");
const { getApi } = require("./controllers/api.controller");
const app = express();

app.get("/api", getApi);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;
