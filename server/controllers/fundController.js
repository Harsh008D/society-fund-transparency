const Fund = require("../models/fund");
const User = require("../models/user");


const createFund = async (req, res) => {
    try {
      const { name, amount, type, description, date } = req.body;
  
      const user = await User.findById(req.user.userId);
  
      if (!user || !user.society) {
        return res.status(404).json({
          message: "User or society not found",
        });
      }
  
      const fund = await Fund.create({
        society: user.society,
        name,
        amount,
        type,
        description,
        date,
      });
  
      res.status(201).json({
        message: "Fund created successfully",
        fund,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };


const getFunds = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
  
      if (!user || !user.society) {
        return res.status(404).json({
          message: "User or society not found",
        });
      }
  
      const funds = await Fund.find({
        society: user.society,
      });
  
      res.status(200).json(funds);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

  const updateFund = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
  
      if (!user || !user.society) {
        return res.status(404).json({
          message: "User or society not found",
        });
      }
  
      const { name, amount, type, description, date } = req.body;
  
      const updates = {};
  
      if (name !== undefined) updates.name = name;
      if (amount !== undefined) updates.amount = amount;
      if (type !== undefined) updates.type = type;
      if (description !== undefined) updates.description = description;
      if (date !== undefined) updates.date = date;
  
      const fund = await Fund.findOneAndUpdate(
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
  
      if (!fund) {
        return res.status(404).json({
          message: "Fund not found",
        });
      }
  
      res.status(200).json({
        message: "Fund updated successfully",
        fund,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
  
  const deleteFund = async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
  
      if (!user || !user.society) {
        return res.status(404).json({
          message: "User or society not found",
        });
      }
  
      const fund = await Fund.findOneAndDelete({
        _id: req.params.id,
        society: user.society,
      });
  
      if (!fund) {
        return res.status(404).json({
          message: "Fund not found",
        });
      }
  
      res.status(200).json({
        message: "Fund deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

  module.exports = {createFund, getFunds, updateFund, deleteFund,};