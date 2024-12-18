const endpointsJson = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArtId,
  addCommentToArticle,
  updateVoteByArticle,
  deleteCommentById,
  fetchCommentsByComId,
  fetchUsers,
  fetchUserByUsername,
} = require("../models/api.model");
exports.getApi = (req, res) => {
  return res.send({ endpoints: endpointsJson });
};

exports.getArticleById = async (req, res, next) => {
  try {
    const { article_id: articleId } = req.params;
    if (isNaN(articleId)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    const article = await fetchArticleById(articleId);
    if (!article) {
      return res.status(404).send({ msg: "Article not found" });
    }
    res.send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    const { sort_by = "created_at", order = "DESC", topic } = req.query;
    const validColumns = [
      "article_id",
      "title",
      "topic",
      "author",
      "created_at",
      "votes",
      "comment_count",
      "article_img_url",
    ];
    const validOrders = ["ASC", "DESC"];
    if (
      !validColumns.includes(sort_by) ||
      !validOrders.includes(order.toUpperCase())
    ) {
      return res.status(400).send({ msg: "Invalid query" });
    }
    const articles = await fetchAllArticles(sort_by, order, topic);
    res.send({ articles });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { article_id: articleId } = req.params;
    if (isNaN(articleId)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    if (!(await fetchArticleById(articleId))) {
      return res.status(404).send({ msg: "Article not found" });
    }
    const comments = await fetchCommentsByArtId(articleId);
    res.send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.postCommentByArticle = async (req, res, next) => {
  try {
    const { article_id: articleId } = req.params;
    if (isNaN(articleId)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    if (!(await fetchArticleById(articleId))) {
      return res.status(404).send({ msg: "Article not found" });
    }
    const { username, body } = req.body;
    if (!username || !body) {
      return res
        .status(400)
        .send({ msg: "Bad request: missing required fields" });
    }
    const comment = await addCommentToArticle(req.body, articleId);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.patchVoteByArticle = async (req, res, next) => {
  try {
    const { article_id: articleId } = req.params;
    if (isNaN(articleId)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    if (!(await fetchArticleById(articleId))) {
      return res.status(404).send({ msg: "Article not found" });
    }
    const { inc_votes: incVotes } = req.body || {};
    if (!incVotes || typeof incVotes != "number") {
      return res
        .status(400)
        .send({ msg: "Bad request: missing required fields" });
    }
    const updatedArticle = await updateVoteByArticle(req.body, articleId);
    res.send({ updatedArticle });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { comment_id: commentId } = req.params;
    if (isNaN(commentId)) {
      return res.status(400).send({ msg: "Invalid comment_id" });
    }
    if (!(await fetchCommentsByComId(commentId))) {
      return res.status(404).send({ msg: "Comment not found" });
    }
    await deleteCommentById(commentId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.send({ users });
  } catch (err) {
    next(err);
  }
};

exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username: username } = req.params;
    const user = await fetchUserByUsername(username);
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }
    res.send({ user });
  } catch (err) {
    next(err);
  }
};
