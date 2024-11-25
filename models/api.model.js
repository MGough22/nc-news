const db = require("../db/connection");

exports.fetchTopics = async () => {
  const { rows } = await db.query("SELECT * FROM topics");
  return rows;
};
