const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { registerUser, loginUser, } = require("../controllers/authController");
const User = require("../models/user");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);


router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("society");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    let totalMembers = 0;

    if (user.society) {
      totalMembers = await User.countDocuments({
        society: user.society._id,
        role: "resident",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        society: user.society
          ? {
              ...user.society.toObject(),
              totalMembers,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);

    res.status(500).json({
      message: "Could not load user profile",
    });
  }
});

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome, Admin!",
      user: req.user
    });
  }
);
module.exports = router;