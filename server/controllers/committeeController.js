
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Admin creates a committee member
const createCommitteeMember = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const admin = await User.findById(req.user.userId);

    if (!admin || !admin.society) {
      return res.status(404).json({
        message: "Admin or society not found",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const committeeMember = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "committee",
      society: admin.society,
    });

    res.status(201).json({
      message: "Committee member created successfully",
      committeeMember: {
        id: committeeMember._id,
        name: committeeMember.name,
        email: committeeMember.email,
        role: committeeMember.role,
        society: committeeMember.society,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    res.status(500).json({ message: error.message });
  }
};

// Admin gets all committee members in their society
const getCommitteeMembers = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);

    if (!admin || !admin.society) {
      return res.status(404).json({
        message: "Admin or society not found",
      });
    }

    const members = await User.find({
      society: admin.society,
      role: "committee",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin removes a committee member from their society
const deleteCommitteeMember = async (req, res) => {
  try {
    const admin = await User.findById(req.user.userId);

    if (!admin || !admin.society) {
      return res.status(404).json({
        message: "Admin or society not found",
      });
    }

    const member = await User.findOneAndDelete({
      _id: req.params.id,
      society: admin.society,
      role: "committee",
    });

    if (!member) {
      return res.status(404).json({
        message: "Committee member not found",
      });
    }

    res.status(200).json({
      message: "Committee member removed successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCommitteeMember,
  getCommitteeMembers,
  deleteCommitteeMember,
};
