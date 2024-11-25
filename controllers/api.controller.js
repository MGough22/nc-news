const endpointsJson = require("../endpoints.json");
exports.getApi = (req, res) => {
  return res.status(200).send({ endpoints: endpointsJson });
};
