
const Expense = require("../models/expense");
const User = require("../models/user");

// Create an expense (admin only)
const createExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date, receiptUrl } =
      req.body;

    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      description,
      society: user.society,
      date,
      receiptUrl,
      recordedBy: user._id,
      status: "Pending",
      approvalHistory: [
        {
          action: "Submitted",
          performedBy: user._id,
          comment: "Expense submitted for approval",
        },
      ],
    });

    res.status(201).json({
      message: "Expense submitted for approval",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get expenses for the logged-in user's society
const getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const expenses = await Expense.find({
      society: user.society,
    })
      .populate("recordedBy", "name email")
      .populate("approvedBy", "name email")
      .populate("approvalHistory.performedBy", "name email")
      .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update an expense (admin only, pending expenses only)
const updateExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const {
      title,
      amount,
      category,
      description,
      date,
      receiptUrl,
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (amount !== undefined) updates.amount = amount;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (receiptUrl !== undefined) updates.receiptUrl = receiptUrl;

    const expense = await Expense.findOne({
      _id: req.params.id,
      society: user.society,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending expenses can be edited",
      });
    }

    Object.assign(expense, updates);
    await expense.save();

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete an expense (admin only)
const deleteExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      society: user.society,
      status: "Pending",
    });

    if (!expense) {
      return res.status(404).json({
        message: "Pending expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Approve an expense (committee only)
const approveExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      society: user.society,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.status !== "Pending") {
      return res.status(400).json({
        message: "This expense has already been reviewed",
      });
    }

    expense.status = "Approved";
    expense.approvedBy = user._id;
    expense.reviewedAt = new Date();
    expense.rejectionReason = "";

    expense.approvalHistory.push({
      action: "Approved",
      performedBy: user._id,
      comment: req.body.comment || "Expense approved",
    });

    await expense.save();

    res.status(200).json({
      message: "Expense approved successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Reject an expense (committee only)
const rejectExpense = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || !user.society) {
      return res.status(404).json({
        message: "User or society not found",
      });
    }

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required",
      });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      society: user.society,
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    if (expense.status !== "Pending") {
      return res.status(400).json({
        message: "This expense has already been reviewed",
      });
    }

    expense.status = "Rejected";
    expense.approvedBy = user._id;
    expense.reviewedAt = new Date();
    expense.rejectionReason = reason.trim();

    expense.approvalHistory.push({
      action: "Rejected",
      performedBy: user._id,
      comment: reason.trim(),
    });

    await expense.save();

    res.status(200).json({
      message: "Expense rejected successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
};
