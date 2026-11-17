
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  requestChanges,
} = require("../controllers/expenseController");

// Admin: create expenses
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createExpense
);

// All logged-in users: view expenses
router.get("/", protect, getExpenses);

// Admin: edit or delete pending expenses
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateExpense
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteExpense
);

// Committee: approve or reject expenses
router.patch(
  "/:id/approve",
  protect,
  authorizeRoles("committee"),
  approveExpense
);

router.patch(
  "/:id/reject",
  protect,
  authorizeRoles("committee"),
  rejectExpense
);

// Committee: request changes to an expense
router.patch(
  "/:id/request-changes",
  protect,
  authorizeRoles("committee"),
  requestChanges
);

module.exports = router;
