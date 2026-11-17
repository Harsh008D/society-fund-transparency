
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
  getCommitteeMembers,
  deleteCommitteeMember,
} = require("../controllers/committeeController");

// Create society
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSociety
);

// Get societies
router.get("/", protect, getSocieties);

// Create committee member
router.post(
  "/committee",
  protect,
  authorizeRoles("admin"),
  createCommitteeMember
);

// Get committee members
router.get(
  "/committee",
  protect,
  authorizeRoles("admin"),
  getCommitteeMembers
);

// Delete committee member
router.delete(
  "/committee/:id",
  protect,
  authorizeRoles("admin"),
  deleteCommitteeMember
);

module.exports = router;
