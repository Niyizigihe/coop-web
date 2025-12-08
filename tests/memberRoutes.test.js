import request from "supertest";
import app from "../src/server.js";
import { describe, it, expect, afterAll } from "@jest/globals";
import { db } from "../src/config/db.js";

describe("GET /members", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/members");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);

  afterAll(async () => {
    await db.end();
  });
});