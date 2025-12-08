import request from "supertest";
import app from "../src/server.js"; // <- use server.js
import { describe, it, expect } from "@jest/globals";

describe("GET /hello", () => {
  it("should return greeting message", async () => {
    const res = await request(app).get("/hello");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Hello DevOps!");
  });
});
