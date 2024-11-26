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
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(testData.articleData.length);
    body.forEach(article => {
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
    const { body } = await request(app).get("/api/articles").expect(200);
    expect(body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
});
