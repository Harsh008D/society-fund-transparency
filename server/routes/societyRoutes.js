const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {createSociety, getSocieties} = require("../controllers/societyController");
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createSociety
);
router.get("/", protect, getSocieties);

module.exports = router;