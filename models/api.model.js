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

exports.fetchAllArticles = async (sortBy, order) => {
  try {
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
      !validColumns.includes(sortBy) ||
      !validOrders.includes(order.toUpperCase())
    ) {
      throw new Error("invalid query parameters");
    }
    const { rows: articles } = await db.query(
      `
        SELECT articles.*, COALESCE(SUM(comments.votes), 0)::INTEGER AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY articles.${sortBy} ${order};
      `
    );
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

exports.fetchCommentsByComId = async id => {
  try {
    const { rows } = await db.query(
      `
          SELECT * FROM comments WHERE comment_id = $1
        `,
      [id]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to fetch comment");
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

exports.updateVoteByArticle = async (voteObject, id) => {
  try {
    const { rows } = await db.query(
      `
        UPDATE articles
        SET votes = votes + $1
        WHERE article_id = $2
        RETURNING *;
      `,
      [voteObject.inc_votes, id]
    );
    return rows[0];
  } catch (err) {
    throw new Error("Failed to update votes");
  }
};

exports.deleteCommentById = async id => {
  try {
    await db.query(
      `
      DELETE FROM comments
      WHERE comment_id = $1;
      `,
      [id]
    );
  } catch (err) {
    throw new Error("Failed to delete comment");
  }
};

exports.fetchUsers = async () => {
  try {
    const { rows } = await db.query(`SELECT * FROM users;`);
    return rows;
  } catch (err) {
    throw new Error("Failed to get users");
  }
};
