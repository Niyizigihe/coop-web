import express from "express";
import { MemberController } from "../controllers/memberController.js";

const router = express.Router();

router.get("/", (req, res) => res.redirect("/members"));
router.get("/members", MemberController.showMembers);

router.get("/members/add", MemberController.showAddForm);
router.post("/members/add", MemberController.addMember);

router.get("/members/edit/:id", MemberController.showEditForm);
router.post("/members/edit/:id", MemberController.updateMember);

router.get("/members/delete/:id", MemberController.deleteMember);

export default router;
