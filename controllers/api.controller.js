const endpointsJson = require("../endpoints.json");
const { fetchTopics } = require("../models/api.model");
exports.getApi = (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
};

exports.getTopics = async (req, res, next) => {
  try {
    const topics = await fetchTopics();
    res.status(200).send({ topics });
  } catch (err) {
    next(err);
  }
};
