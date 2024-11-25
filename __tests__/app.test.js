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
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("200: Responds with a JSON object", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});
test("404: Responds with an error message for non-existent route", () => {
  return request(app)
    .get("/api/non-existent-route")
    .expect(404)
    .then(({ body }) => {
      expect(body).toEqual({ msg: "Route not found" });
    });
});
describe("Get api/topics", () => {
  test("200: Responds with an array of topic objects, each with slug & description properties", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toEqual(testData.topicData);
      });
  });
  test("200: Topics have the correct data types", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        topics.forEach(topic => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
  test("200: Topics only contain 'slug' and 'description'", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        topics.forEach(topic => {
          expect(Object.keys(topic)).toEqual(["slug", "description"]);
        });
      });
  });
});
