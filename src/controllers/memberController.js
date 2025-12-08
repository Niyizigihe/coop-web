import { MemberModel } from "../models/memberModel.js";

export const MemberController = {
  async showMembers(req, res) {
    const [members] = await MemberModel.getAll();
    res.render("members", { members });
  },

  showAddForm(req, res) {
    res.render("add-member");
  },

  async addMember(req, res) {
    await MemberModel.create(req.body);
    res.redirect("/members");
  },

  async showEditForm(req, res) {
    const [result] = await MemberModel.getById(req.params.id);
    res.render("edit-member", { member: result[0] });
  },

  async updateMember(req, res) {
    await MemberModel.update(req.params.id, req.body);
    res.redirect("/members");
  },

  async deleteMember(req, res) {
    await MemberModel.delete(req.params.id);
    res.redirect("/members");
  }
};
