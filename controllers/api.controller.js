const endpointsJson = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
  fetchCommentsByArtId,
} = require("../models/api.model");
exports.getApi = (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
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
    res.status(200).send({ article });
  } catch (err) {
    next(err);
  }
};

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    const articles = await fetchAllArticles();
    res.status(200).send({ articles });
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
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};
