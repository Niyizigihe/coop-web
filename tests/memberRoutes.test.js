// tests/memberRoutes.test.js
import request from "supertest";
import express from "express";
import memberRoutes from "../src/routes/memberRoutes.js";
import { describe, it, expect } from "@jest/globals";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/", memberRoutes);

describe("GET /members", () => {
  it("should return 200", async () => {
    const res = await request(app).get("/members");
    expect(res.status).toBe(200);
  });
});
