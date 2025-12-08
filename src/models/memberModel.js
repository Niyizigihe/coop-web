import { db } from "../config/db.js";

export const MemberModel = {
  getAll() {
    return db.query("SELECT * FROM members ORDER BY id DESC");
  },

  getById(id) {
    return db.query("SELECT * FROM members WHERE id = ?", [id]);
  },

  create(data) {
    const { names, national_id, phone, cooperative_name } = data;
    return db.query(
      "INSERT INTO members (names, national_id, phone, cooperative_name) VALUES (?, ?, ?, ?)",
      [names, national_id, phone, cooperative_name]
    );
  },

  update(id, data) {
    const { names, national_id, phone, cooperative_name } = data;
    return db.query(
      "UPDATE members SET names=?, national_id=?, phone=?, cooperative_name=? WHERE id=?",
      [names, national_id, phone, cooperative_name, id]
    );
  },

  delete(id) {
    return db.query("DELETE FROM members WHERE id=?", [id]);
  }
};
