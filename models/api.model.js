const db = require("../db/connection");

exports.fetchTopics = async () => {
  const { rows } = await db.query("SELECT * FROM topics");
  return rows;
};

exports.fetchArticleById = async id => {
  const { rows } = await db.query(
    "SELECT * FROM articles WHERE article_id = $1;",
    [id]
  );
  return rows[0];
};

exports.fetchAllArticles = async () => {
  const { rows } = await db.query("SELECT * FROM articles;");
  const result = rows
    .map(({ body, ...rest }) => rest)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const countVotes = async id => {
    const { rows } = await db.query(
      "SELECT SUM(votes) FROM comments WHERE article_id = $1;",
      [id]
    );
    return rows[0].sum || 0;
  };
  await Promise.all(
    result.map(async el => {
      el.comment_count = Number(await countVotes(el.article_id));
    })
  );
  return result;
};
