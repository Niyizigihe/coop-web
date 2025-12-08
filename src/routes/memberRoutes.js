import express from "express";
import { MemberModel } from "../models/memberModel.js";

const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("index");
});

// Members page - return JSON for API requests, render HTML for browser
router.get("/members", async (req, res) => {
  try {
    const [members] = await MemberModel.getAll();
    
    // Check if request prefers JSON (from supertest or Accept header)
    const acceptsJson = req.accepts(['json', 'html']) === 'json';
    
    if (acceptsJson) {
      return res.status(200).json(members);
    }
    
    // Default: render HTML for browser
    res.render("members", { members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Show add member form
router.get("/members/new", (req, res) => {
  res.render("member-form", { isEdit: false, member: {} });
});

// Show edit member form
router.get("/members/:id/edit", async (req, res) => {
  try {
    const { id } = req.params;
    const [members] = await MemberModel.getById(id);
    if (members.length === 0) {
      return res.status(404).render("error", { error: "Member not found" });
    }
    res.render("member-form", { isEdit: true, member: members[0] });
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

// Create new member
router.post("/members", async (req, res) => {
  try {
    const { names, national_id, phone, cooperative_name } = req.body;
    
    if (!names || !national_id || !phone || !cooperative_name) {
      return res.status(400).render("error", { error: "All fields are required" });
    }

    await MemberModel.create({
      names,
      national_id,
      phone,
      cooperative_name
    });
    res.redirect("/members");
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

// Update member
router.post("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { names, national_id, phone, cooperative_name } = req.body;

    if (!names || !national_id || !phone || !cooperative_name) {
      return res.status(400).render("error", { error: "All fields are required" });
    }

    await MemberModel.update(id, {
      names,
      national_id,
      phone,
      cooperative_name
    });
    res.redirect("/members");
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

// Delete member
router.post("/members/:id/delete", async (req, res) => {
  try {
    const { id } = req.params;
    await MemberModel.delete(id);
    res.redirect("/members");
  } catch (error) {
    res.status(500).render("error", { error: error.message });
  }
});

export default router;
