import { MemberModel } from "../models/memberModel.js";

export const showMembers = async (req, res) => {
  try {
    const [members] = await MemberModel.getAll();
    if (res.json) {
      res.json(members);
    }
    return [members];
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const [member] = await MemberModel.getById(id);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    const { names, national_id, phone, cooperative_name } = req.body;
    const result = await MemberModel.create({
      names,
      national_id,
      phone,
      cooperative_name
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { names, national_id, phone, cooperative_name } = req.body;
    const result = await MemberModel.update(id, {
      names,
      national_id,
      phone,
      cooperative_name
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await MemberModel.delete(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
