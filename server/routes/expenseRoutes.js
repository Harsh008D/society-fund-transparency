const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");

// Admin only: create an expense
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createExpense
);

// Logged-in users: view expenses for a society
router.get(
  "/:societyId",
  protect,
  getExpenses
);

// Admin only: update an expense
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateExpense
);

// Admin only: delete an expense
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteExpense
);

module.exports = router;