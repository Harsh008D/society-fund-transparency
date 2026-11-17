const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createSociety,
  getSocieties,
} = require("../controllers/societyController");

const {
  createCommitteeMember,
} = require("../controllers/committeeController");

// Create society (admin only)
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSociety
);

// Get societies
router.get("/", protect, getSocieties);

// Create committee member (admin only)
router.post(
  "/committee",
  protect,
  authorizeRoles("admin"),
  createCommitteeMember
);

module.exports = router;