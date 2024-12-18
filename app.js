const cors = require("cors");
const express = require("express");
const {
  getApi,
  getTopics,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticle,
  patchVoteByArticle,
  deleteComment,
  getUsers,
  getUserByUsername,
} = require("./controllers/api.controller");
const app = express();

app.use(cors());

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.get("/api/users", getUsers);

app.get("/api/users/:username", getUserByUsername);

app.post("/api/articles/:article_id/comments", postCommentByArticle);

app.patch("/api/articles/:article_id", patchVoteByArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: err.message || "Internal Server Error",
  });
});

module.exports = app;
