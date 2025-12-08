import { MemberModel } from "../src/models/memberModel.js";
import { db } from "../src/config/db.js";

describe("MemberModel unit tests", () => {

  test("should create a new member", async () => {
    const result = await MemberModel.create({
      names: "Test Member",
      national_id: "12345678901234",
      phone: "0781234567",
      cooperative_name: "Test Coop"
    });
    expect(result[0].affectedRows).toBe(1);

    // Clean up
    await db.query("DELETE FROM members WHERE national_id=?", ["12345678901234"]);
  });

});
