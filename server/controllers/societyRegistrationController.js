const Society = require("../models/society");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSociety = async (req, res) => {
  let society;

  try {
    const {
      societyName,
      address,
      adminName,
      email,
      password,
    } = req.body || {};

    // Validate required fields
    if (
      !societyName ||
      !address ||
      !adminName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if admin email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    // Create the society
    society = await Society.create({
      name: societyName.trim(),
      address: address.trim(),
    });

    // Hash admin password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the society admin
    const admin = await User.create({
      name: adminName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "admin",
      society: society._id,
    });

    // Create login token
    const token = jwt.sign(
      {
        userId: admin._id,
        role: admin.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Society registered successfully",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        society: society._id,
      },
      society,
    });
  } catch (error) {
    // Remove society if admin creation failed
    if (society) {
      await Society.findByIdAndDelete(society._id)
        .catch(console.error);
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    console.error("Society registration error:", error);

    return res.status(500).json({
      message: "Society registration failed",
    });
  }
};

module.exports = { registerSociety };