const endpointsJson = require("../endpoints.json");
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const request = require("supertest");
const app = require("../app");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", async () => {
    const {
      body: { endpoints },
    } = await request(app).get("/api").expect(200);
    expect(endpoints).toEqual(endpointsJson);
  });
  test("200: Responds with a JSON object", async () => {
    await request(app)
      .get("/api")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
test("404: Responds with an error message for non-existent route", async () => {
  const { body } = await request(app)
    .get("/api/non-existent-route")
    .expect(404);
  expect(body).toEqual({ msg: "Route not found" });
});
describe("Get api/topics", () => {
  test("200: Responds with an array of topic objects, each with slug & description properties", async () => {
    const {
      body: { topics },
    } = await request(app).get("/api/topics").expect(200);
    expect(topics).toEqual(testData.topicData);
  });
  test("200: Topics have the correct data types", async () => {
    const {
      body: { topics },
    } = await request(app).get("/api/topics").expect(200);
    topics.forEach(topic => {
      expect(typeof topic.slug).toBe("string");
      expect(typeof topic.description).toBe("string");
    });
  });
  test("200: Topics only contain 'slug' and 'description'", async () => {
    const {
      body: { topics },
    } = await request(app).get("/api/topics").expect(200);
    topics.forEach(topic => {
      expect(Object.keys(topic)).toEqual(["slug", "description"]);
    });
  });
});
describe("Get /api/articles/:article_id", () => {
  test("200: Returns the unique article object corresponidng to the given id with expected properties", async () => {
    for (let i = 1; i <= testData.articleData.length; i++) {
      const {
        body: { article },
      } = await request(app).get(`/api/articles/${i}`).expect(200);
      expect(article).not.toBeNull();
      expect(article.constructor).toBe(Object);
      expect(article.article_id).toBe(i);
      const expectedKeys = [
        "article_id",
        "title",
        "topic",
        "author",
        "body",
        "created_at",
        "votes",
        "article_img_url",
      ];
      expect(Object.keys(article)).toEqual(expectedKeys);
    }
  });
  test("400: Responds with an error message when given a non-numeric article_id", async () => {
    const { body } = await request(app)
      .get("/api/articles/invalid")
      .expect(400);
    expect(body).toEqual({ msg: "Invalid article_id" });
  });
  test("404: Responds with an error message when the article_id does not exist", async () => {
    const { body } = await request(app).get("/api/articles/9999").expect(404);
    expect(body).toEqual({ msg: "Article not found" });
  });
});
describe("Get /api/articles", () => {
  test("200: returns all article objects in an array with the expected properties only", async () => {
    const {
      body: { articles },
    } = await request(app).get("/api/articles").expect(200);
    expect(articles.length).toBe(testData.articleData.length);
    articles.forEach(article => {
      expect(article).toEqual(
        expect.objectContaining({
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        })
      );
    });
  });
  test("article objects are served sorted by date in descending order", async () => {
    const {
      body: { articles },
    } = await request(app).get("/api/articles").expect(200);
    expect(articles).toBeSortedBy("created_at", {
      descending: true,
    });
  });
});
describe("Get /api/articles/:article_id/comments", () => {
  test(`200: responds with an array of the commment objects for the specified article_id exclusivvely, 
    an empty array if none are associated, and ordered by date descending`, async () => {
    const articlesWithComments = [1, 3, 5, 6, 9];
    for (let i = 1; i <= testData.articleData.length; i++) {
      const {
        body: { comments },
      } = await request(app).get(`/api/articles/${i}/comments`).expect(200);
      expect(Array.isArray(comments)).toBe(true);
      if (!articlesWithComments.includes(i)) {
        expect(comments).toEqual([]);
      } else {
        expect(comments.length).toBeGreaterThanOrEqual(1);
        comments.forEach(comment => {
          expect(comment).toEqual(
            expect.objectContaining({
              article_id: i,
              body: expect.any(String),
              comment_id: expect.any(Number),
              author: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
            })
          );
        });
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      }
    }
  });
  test("400: Responds with an error message when given a non-numeric article_id", async () => {
    const { body } = await request(app)
      .get("/api/articles/invalid/comments")
      .expect(400);
    expect(body).toEqual({ msg: "Invalid article_id" });
  });
  test("404: Responds with an error message when the article_id does not exist", async () => {
    const { body } = await request(app)
      .get("/api/articles/98765/comments")
      .expect(404);
    expect(body).toEqual({ msg: "Article not found" });
  });
});
describe("POST /api/articles/:article_id/comments", () => {
  test("201: Creates a new comment in the comments table in the expected format, and responds with the created comment object", async () => {
    const newComment = { username: "butter_bridge", body: "Great article!" };
    const {
      body: { comment },
    } = await request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201);
    expect(comment).toEqual(
      expect.objectContaining({
        comment_id: expect.any(Number),
        body: "Great article!",
        article_id: 1,
        author: "butter_bridge",
        votes: 0,
        created_at: expect.any(String),
      })
    );
    const {
      body: { comments },
    } = await request(app).get(`/api/articles/1/comments`);
    expect(comments[0]).toEqual(comment);
  });
  test("400: Responds with an error message if required fields are missing", async () => {
    const newCommentWithoutBody = { username: "butter_bridge" };
    const { body: body1 } = await request(app)
      .post("/api/articles/1/comments")
      .send(newCommentWithoutBody)
      .expect(400);

    expect(body1).toEqual({ msg: "Bad request: missing required fields" });

    const newCommentWithoutUsername = { body: "something" };
    const { body: body2 } = await request(app)
      .post("/api/articles/1/comments")
      .send(newCommentWithoutUsername)
      .expect(400);

    expect(body2).toEqual({ msg: "Bad request: missing required fields" });

    const newCommentWithoutAnyProperties = {};
    const { body: body3 } = await request(app)
      .post("/api/articles/1/comments")
      .send(newCommentWithoutAnyProperties)
      .expect(400);

    expect(body3).toEqual({ msg: "Bad request: missing required fields" });
  });

  test("404: Responds with an error message if article_id does not exist", async () => {
    const newComment = { username: "butter_bridge", body: "Great article!" };
    const { body } = await request(app)
      .post("/api/articles/98765/comments")
      .send(newComment)
      .expect(404);

    expect(body).toEqual({ msg: "Article not found" });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test(`200: Updates an article's votes by a given increment, 
    and responds with the updated article object`, async () => {
    const testIncrements = [
      { inc_votes: 1 },
      { inc_votes: 100 },
      { inc_votes: -101 },
    ];
    const testArticleIds = [1, 5, 8];
    for (const testArticleId of testArticleIds) {
      let startVote = testData.articleData[testArticleId - 1].votes || 0;
      for (const testInc of testIncrements) {
        const {
          body: { updatedArticle },
        } = await request(app)
          .patch(`/api/articles/${testArticleId}`)
          .send(testInc)
          .expect(200);
        expect(updatedArticle).toEqual(
          expect.objectContaining({
            article_id: testArticleId,
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            article_img_url: expect.any(String),
            votes: startVote + testInc.inc_votes,
          })
        );
        const {
          body: { article },
        } = await request(app).get(`/api/articles/${testArticleId}`);
        expect(updatedArticle).toEqual(article);
        startVote += testInc.inc_votes;
      }
    }
  });
  test(`400: Responds with an error message if request body is missing fields or incorrectly formatted`, async () => {
    const testInc1 = { inc_votes: "blue" };
    const { body: body1 } = await request(app)
      .patch(`/api/articles/1`)
      .send(testInc1)
      .expect(400);
    expect(body1).toEqual({ msg: "Bad request: missing required fields" });

    const testInc2 = { jinx: 25 };
    const { body: body2 } = await request(app)
      .patch(`/api/articles/1`)
      .send(testInc2)
      .expect(400);
    expect(body2).toEqual({ msg: "Bad request: missing required fields" });

    const testInc3 = {};
    const { body: body3 } = await request(app)
      .patch(`/api/articles/1`)
      .send(testInc3)
      .expect(400);
    expect(body3).toEqual({ msg: "Bad request: missing required fields" });
  });
  test(`400: Responds with an error message if article_id is not a number`, async () => {
    const testInc = { inc_votes: 1 };
    const { body } = await request(app)
      .patch(`/api/articles/poseidon`)
      .send(testInc)
      .expect(400);
    expect(body).toEqual({ msg: "Invalid article_id" });
  });
  test(`404: Responds with an error message if article_id does not exist`, async () => {
    const testInc = { inc_votes: 1 };
    const { body } = await request(app)
      .patch(`/api/articles/9876`)
      .send(testInc)
      .expect(404);
    expect(body).toEqual({ msg: "Article not found" });
  });
});

describe("DELETE /api/comments/:comment_id.", () => {
  test("204: Deletes specified comment from db", async () => {
    await request(app).delete(`/api/comments/6`).expect(204);
    const { rows } = await db.query(
      `
        SELECT * FROM comments WHERE comment_id = 6;
      `
    );
    expect(rows).toEqual([]);
  });
  test("400: Responds with an error message if comment_id is not a number,", async () => {
    const { body } = await request(app)
      .delete(`/api/comments/jeremiah`)
      .expect(400);
    expect(body).toEqual({ msg: "Invalid comment_id" });
  });
  test("404: Responds with an error message if specified comment does not exist,", async () => {
    const { body } = await request(app)
      .delete(`/api/comments/314159`)
      .expect(404);
    expect(body).toEqual({ msg: "Comment not found" });
  });
});

describe("GET /api/users", () => {
  test("200: responds with array of user objects wih expcted properties", async () => {
    const {
      body: { users },
    } = await request(app).get("/api/users").expect(200);
    expect(users.length).toBe(testData.userData.length);
    users.forEach(user => {
      expect(user).toEqual(
        expect.objectContaining({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        })
      );
    });
  });
});
