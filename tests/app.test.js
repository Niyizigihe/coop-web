import request from "supertest";
import app from "../src/server.js";
import { describe, it, expect, afterAll } from "@jest/globals";
import { db } from "../src/config/db.js";

describe("GET /hello", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/hello");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Hello DevOps!");
  });

  afterAll(async () => {
    await db.end();
  });
});
