const request = require("supertest");
const app = require("../src/app");

describe("GET /hello", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/hello");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Hello DevOps!");
  });
});
