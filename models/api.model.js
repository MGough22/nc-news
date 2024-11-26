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
  try {
    const { rows: articles } = await db.query(`
        SELECT articles.*, COALESCE(SUM(comments.votes), 0)::INTEGER AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.created_at DESC;
      `);
    return articles.map(({ body, ...rest }) => rest);
  } catch (err) {
    throw new Error("Failed to fetch articles");
  }
};

exports.fetchCommentsByArtId = async id => {
  try {
    const { rows } = await db.query(
      `
        SELECT * FROM comments WHERE article_id = $1
        ORDER BY comments.created_at DESC;
      `,
      [id]
    );
    return rows;
  } catch (err) {
    throw new Error("Failed to fetch comments");
  }
};

exports.addCommentToArticle = async (comment, id) => {
  try {
    const { rows } = await db.query(
      `
          INSERT INTO comments (author, body, article_id) 
          VALUES ($1, $2, $3)
          RETURNING *;
          `,
      [comment.username, comment.body, id]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to add comment");
  }
};
