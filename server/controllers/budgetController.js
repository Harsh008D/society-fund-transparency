const Budget = require("../models/Budget");
const Expense = require("../models/expense");
const User = require("../models/user");

const VALID_CATEGORIES = [
  "Maintenance",
  "Electricity",
  "Water",
  "Security",
  "Cleaning",
  "Repairs",
  "Events",
  "Other",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getFinancialYearDates = (financialYear) => {
  const [startYear, endYear] = financialYear.split("-").map(Number);

  if (
    !Number.isInteger(startYear) ||
    !Number.isInteger(endYear) ||
    endYear !== startYear + 1
  ) {
    return null;
  }

  return {
    start: new Date(startYear, 3, 1),
    end: new Date(endYear, 3, 1),
  };
};

const validateMonthlyAllocations = (monthlyAllocations, annualAllocation) => {
  if (!Array.isArray(monthlyAllocations) || monthlyAllocations.length !== 12) {
    return "All 12 monthly allocations are required";
  }

  const months = monthlyAllocations.map((item) => item.month);

  if (new Set(months).size !== 12) {
    return "Each month must have exactly one allocation";
  }

  const validMonths = monthlyAllocations.every(
    (item) =>
      Number.isInteger(item.month) &&
      item.month >= 1 &&
      item.month <= 12 &&
      Number.isFinite(item.amount) &&
      item.amount >= 0
  );

  if (!validMonths) {
    return "Invalid monthly allocation values";
  }

  const monthlyTotal = monthlyAllocations.reduce(
    (total, item) => total + item.amount,
    0
  );

  if (Math.abs(monthlyTotal - annualAllocation) > 0.01) {
    return "Monthly allocations must equal the annual allocation";
  }

  return null;
};

// Create a budget (admin only)
const createBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const {
      financialYear,
      category,
      annualAllocation,
      monthlyAllocations,
      carryForwardEnabled,
    } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid budget category",
      });
    }

    if (
      carryForwardEnabled !== undefined &&
      typeof carryForwardEnabled !== "boolean"
    ) {
      return res.status(400).json({
        message: "carryForwardEnabled must be true or false",
      });
    }

    if (!financialYear || !/^\d{4}-\d{4}$/.test(financialYear)) {
      return res.status(400).json({
        message: "Valid financial year is required (YYYY-YYYY)",
      });
    }

    if (!Number.isFinite(annualAllocation) || annualAllocation < 0) {
      return res.status(400).json({
        message: "Valid annual allocation is required",
      });
    }

    const dates = getFinancialYearDates(financialYear);

    if (!dates) {
      return res.status(400).json({
        message: "Invalid financial year",
      });
    }

    const allocationError = validateMonthlyAllocations(
      monthlyAllocations,
      annualAllocation
    );

    if (allocationError) {
      return res.status(400).json({
        message: allocationError,
      });
    }

    const existingBudget = await Budget.findOne({
      society: user.society,
      financialYear,
      category,
    });

    if (existingBudget) {
      return res.status(409).json({
        message: "Budget already exists for this category and financial year",
      });
    }

    const budget = await Budget.create({
      society: user.society,
      financialYear,
      category,
      annualAllocation,
      monthlyAllocations,
      carryForwardEnabled: Boolean(carryForwardEnabled),
      createdBy: user._id,

      allocationHistory: [
        {
          action: "Created",
          previousAnnualAllocation: null,
          newAnnualAllocation: annualAllocation,
          previousMonthlyAllocations: [],
          newMonthlyAllocations: monthlyAllocations,
          previousCarryForwardEnabled: null,
          newCarryForwardEnabled: Boolean(carryForwardEnabled),
          changedBy: user._id,
        },
      ],
    });
    res.status(201).json({
      message: "Budget created successfully",
      budget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Budget already exists for this category and financial year",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get budgets with actual approved spending
const getBudgets = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const filter = {
      society: user.society,
    };

    if (req.query.financialYear) {
        if (
          !/^\d{4}-\d{4}$/.test(req.query.financialYear) ||
          !getFinancialYearDates(req.query.financialYear)
        ) {
          return res.status(400).json({
            message: "Invalid financial year. Use format YYYY-YYYY with consecutive years.",
          });
        }
      
        filter.financialYear = req.query.financialYear;
      }

    const budgets = await Budget.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ financialYear: -1, category: 1 });

    const results = await Promise.all(
      budgets.map(async (budget) => {
        const dates = getFinancialYearDates(budget.financialYear);

        const expenses = await Expense.find({
          society: user.society,
          category: budget.category,
          status: "Approved",
          date: {
            $gte: dates.start,
            $lt: dates.end,
          },
        }).select("amount date");

        const monthlySpent = Array(12).fill(0);

        let totalSpent = 0;

        expenses.forEach((expense) => {
          const monthIndex = expense.date.getMonth();

          monthlySpent[monthIndex] += expense.amount;
          totalSpent += expense.amount;
        });

        const orderedAllocations = [...budget.monthlyAllocations].sort(
          (a, b) => {
            const fiscalOrder = (month) => (month + 8) % 12;
            return fiscalOrder(a.month) - fiscalOrder(b.month);
          }
        );

        let carryForwardBalance = 0;

        const monthlyBreakdown = orderedAllocations.map((allocation) => {
          const spent = monthlySpent[allocation.month - 1];

          const carryForwardIn = budget.carryForwardEnabled
            ? carryForwardBalance
            : 0;

          const availableBudget = allocation.amount + carryForwardIn;

          const remaining = availableBudget - spent;

          carryForwardBalance = budget.carryForwardEnabled ? remaining : 0;

          return {
            month: allocation.month,
            monthName: MONTHS[allocation.month - 1],
            allocated: allocation.amount,
            carryForwardIn,
            availableBudget,
            spent,
            remaining,
            carryForwardOut: carryForwardBalance,
          };
        });

        return {
          ...budget.toObject(),
          actualSpent: totalSpent,
          remainingBudget: budget.annualAllocation - totalSpent,
          spendingPercentage:
            budget.annualAllocation > 0
              ? Number(
                  ((totalSpent / budget.annualAllocation) * 100).toFixed(2)
                )
              : totalSpent > 0
              ? 100
              : 0,
          monthlyBreakdown,
        };
      })
    );

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update a budget (admin only)
const updateBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      society: user.society,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const { annualAllocation, monthlyAllocations, carryForwardEnabled } =
      req.body;

    if (
      carryForwardEnabled !== undefined &&
      typeof carryForwardEnabled !== "boolean"
    ) {
      return res.status(400).json({
        message: "carryForwardEnabled must be true or false",
      });
    }

    const newAnnual =
      annualAllocation !== undefined
        ? annualAllocation
        : budget.annualAllocation;

    const newMonthly =
      monthlyAllocations !== undefined
        ? monthlyAllocations
        : budget.monthlyAllocations;

    if (!Number.isFinite(newAnnual) || newAnnual < 0) {
      return res.status(400).json({
        message: "Valid annual allocation is required",
      });
    }

    const allocationError = validateMonthlyAllocations(newMonthly, newAnnual);

    if (allocationError) {
      return res.status(400).json({
        message: allocationError,
      });
    }

    // Save previous values before updating
    const previousAnnualAllocation = budget.annualAllocation;

    const previousMonthlyAllocations = budget.monthlyAllocations.map(
      (item) => ({
        month: item.month,
        amount: item.amount,
      })
    );

    const previousCarryForwardEnabled = budget.carryForwardEnabled;

    // Apply new values
    budget.annualAllocation = newAnnual;
    budget.monthlyAllocations = newMonthly;

    if (carryForwardEnabled !== undefined) {
      budget.carryForwardEnabled = carryForwardEnabled;
    }

    budget.updatedBy = user._id;

    // Record allocation change
    budget.allocationHistory.push({
      action: "Updated",
      previousAnnualAllocation,
      newAnnualAllocation: newAnnual,
      previousMonthlyAllocations,
      newMonthlyAllocations: newMonthly,
      previousCarryForwardEnabled,
      newCarryForwardEnabled: budget.carryForwardEnabled,
      changedBy: user._id,
    });

    await budget.save();

    res.status(200).json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a budget (admin only)
const deleteBudget = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      society: user.society,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    res.status(200).json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get budget allocation history (admin and committee)
const getBudgetHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      society: user.society,
    }).populate("allocationHistory.changedBy", "name email");

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    const history = [...budget.allocationHistory].sort(
      (a, b) => new Date(b.changedAt) - new Date(a.changedAt)
    );

    res.status(200).json({
      budgetId: budget._id,
      category: budget.category,
      financialYear: budget.financialYear,
      history,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
  getBudgetHistory,
};
