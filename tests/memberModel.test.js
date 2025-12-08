import { MemberModel } from "../src/models/memberModel.js";
import { db } from "../src/config/db.js";
import { describe, it, expect } from "@jest/globals";

describe("MemberModel", () => {
  it("should insert a member", async () => {
    const result = await MemberModel.create({
      names: "Test Member",
      national_id: "12345678901234",
      phone: "0781234567",
      cooperative_name: "Test Coop"
    });
    expect(result[0].affectedRows).toBe(1);
    await db.query("DELETE FROM members WHERE national_id=?", ["12345678901234"]);
  });
});
