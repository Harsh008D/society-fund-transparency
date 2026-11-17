
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
    getBudgetHistory,
  } = require("../controllers/budgetController");

// Admin: create a budget
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createBudget
);

// All logged-in users: view budgets
router.get(
  "/",
  protect,
  getBudgets
);

// Admin and Committee: view budget history
router.get(
    "/:id/history",
    protect,
    authorizeRoles("admin", "committee"),
    getBudgetHistory
  );

// Admin: update a budget
router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateBudget
);

// Admin: delete a budget
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteBudget
);

module.exports = router;
