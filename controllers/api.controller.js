const endpointsJson = require("../endpoints.json");
const {
  fetchTopics,
  fetchArticleById,
  fetchAllArticles,
} = require("../models/api.model");
exports.getApi = (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
};

exports.getArticleById = async (req, res, next) => {
  try {
    if (isNaN(req.params.article_id)) {
      return res.status(400).send({ msg: "Invalid article_id" });
    }
    const article = await fetchArticleById(req.params.article_id);
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
    res.status(200).send(articles);
  } catch (err) {
    next(err);
  }
};
