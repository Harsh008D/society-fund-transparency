const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Invitation = require("../models/Invitation");
const Society = require("../models/Society");

// Register resident using invitation code
const registerUser = async (req, res) => {
  let reservedInvitation = null;

  try {
    const { name, email, password, invitationCode } = req.body || {};

    if (!name || !email || !password || !invitationCode) {
      return res.status(400).json({
        message: "Name, email, password and invitation code are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = invitationCode.trim().toUpperCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Atomically reserve one use of a valid invitation
    reservedInvitation = await Invitation.findOneAndUpdate(
      {
        code: normalizedCode,
        isActive: true,
        expiresAt: { $gt: new Date() },
        $expr: { $lt: ["$usedCount", "$maxUses"] },
      },
      {
        $inc: { usedCount: 1 },
      },
      { new: true }
    );

    if (!reservedInvitation) {
      return res.status(400).json({
        message: "Invalid, expired, or fully used invitation code",
      });
    }

    // Confirm the referenced society still exists
    const society = await Society.findById(
      reservedInvitation.society
    );

    if (!society) {
      await Invitation.updateOne(
        { _id: reservedInvitation._id },
        { $inc: { usedCount: -1 } }
      );
      reservedInvitation = null;

      return res.status(400).json({
        message: "Invitation society not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "resident",
      society: reservedInvitation.society,
    });

    reservedInvitation = null;

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return res.status(201).json({
      message: "Resident registered successfully",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        society: user.society,
      },
    });
    
  } catch (error) {
    // Release invitation use if account creation failed
    if (reservedInvitation) {
      await Invitation.updateOne(
        { _id: reservedInvitation._id },
        { $inc: { usedCount: -1 } }
      ).catch(console.error);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};


// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get logged-in user's profile and society
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("society");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      message: "Could not load profile",
    });
  }
};

module.exports = {registerUser, loginUser, getProfile,};