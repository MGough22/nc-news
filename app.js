const express = require("express");
const { getApi, getTopics } = require("./controllers/api.controller");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
