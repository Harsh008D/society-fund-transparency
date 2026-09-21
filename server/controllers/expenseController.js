
const Expense = require("../models/expense");
const User = require("../models/user");

// Create an expense (admin only; enforced in routes)
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
    });

    res.status(201).json({
      message: "Expense created successfully",
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
      .sort({ date: -1 });

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update an expense (admin only)
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

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        society: user.society,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

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
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
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

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};