const db = require("../db/connection");

exports.fetchTopics = async () => {
  const { rows } = await db.query("SELECT * FROM topics");
  return rows;
};

const sharedFetchArticleQueryLogic = `SELECT articles.*,
        COUNT(comments.comment_id)::INTEGER AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id`;

exports.fetchArticleById = async id => {
  const { rows } = await db.query(
    sharedFetchArticleQueryLogic +
      `
        WHERE articles.article_id = $1
        GROUP BY articles.article_id
      `,
    [id]
  );
  return rows[0];
};

exports.fetchAllArticles = async (sortBy, order, topic) => {
  try {
    let { rows: articles } = await db.query(
      sharedFetchArticleQueryLogic +
        `
        GROUP BY articles.article_id
        ORDER BY ${
          sortBy === "comment_count" ? "" : "articles."
        }${sortBy} ${order};
      `
    );
    if (topic) {
      articles = articles.filter(el => el.topic === topic);
    }
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
