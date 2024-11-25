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
  test("Returns the unique article object corresponidng to the given id with expected properties", async () => {
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
});
