import { MemberModel } from "../src/models/memberModel.js";
import { db } from "../src/config/db.js";
import { describe, it, expect, afterAll, beforeEach } from "@jest/globals";

describe("MemberModel", () => {
  const testData = {
    names: "Test Member",
    national_id: "99999999999",
    phone: "0781234567",
    cooperative_name: "Test Coop"
  };

  beforeEach(async () => {
    // Clean up before each test
    try {
      await db.query("DELETE FROM members WHERE national_id = ?", [testData.national_id]);
    } catch (e) {
      // Table might not exist yet
    }
  });

  it("should insert a member", async () => {
    const [result] = await MemberModel.create(testData);
    expect(result.affectedRows).toBe(1);
  });

  afterAll(async () => {
    try {
      await db.query("DELETE FROM members WHERE national_id = ?", [testData.national_id]);
    } catch (e) {
      // Cleanup failed, but test is done
    }
    await db.end();
  });
});