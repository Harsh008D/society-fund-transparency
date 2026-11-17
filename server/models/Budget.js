const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    society: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },

    financialYear: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{4}$/, "Use format YYYY-YYYY"],
    },

    category: {
      type: String,
      enum: [
        "Maintenance",
        "Electricity",
        "Water",
        "Security",
        "Cleaning",
        "Repairs",
        "Events",
        "Other",
      ],
      required: true,
    },

    annualAllocation: {
      type: Number,
      required: true,
      min: 0,
    },

    monthlyAllocations: [
      {
        month: {
          type: Number,
          required: true,
          min: 1,
          max: 12,
        },

        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    carryForwardEnabled: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    allocationHistory: [
      {
        action: {
          type: String,
          enum: ["Created", "Updated"],
          required: true,
        },

        previousAnnualAllocation: {
          type: Number,
          default: null,
        },

        newAnnualAllocation: {
          type: Number,
          required: true,
        },

        previousMonthlyAllocations: [
          {
            month: Number,
            amount: Number,
          },
        ],

        newMonthlyAllocations: [
          {
            month: Number,
            amount: Number,
          },
        ],

        previousCarryForwardEnabled: {
          type: Boolean,
          default: null,
        },

        newCarryForwardEnabled: {
          type: Boolean,
          required: true,
        },

        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate budgets for the same
// society, financial year and category.
budgetSchema.index(
  {
    society: 1,
    financialYear: 1,
    category: 1,
  },
  {
    unique: true,
  }
);


// Validate financial year, monthly allocations and annual total
budgetSchema.pre("validate", function () {
    // Validate financial year
    const [startYear, endYear] = this.financialYear
      .split("-")
      .map(Number);
  
    if (
      !Number.isInteger(startYear) ||
      !Number.isInteger(endYear) ||
      endYear !== startYear + 1
    ) {
      this.invalidate(
        "financialYear",
        "Financial year must contain two consecutive years."
      );
    }
  
    // Validate exactly 12 monthly allocations
    if (
      !Array.isArray(this.monthlyAllocations) ||
      this.monthlyAllocations.length !== 12
    ) {
      this.invalidate(
        "monthlyAllocations",
        "Exactly 12 monthly allocations are required."
      );
    } else {
      const months = this.monthlyAllocations.map(
        (item) => item.month
      );
  
      if (new Set(months).size !== 12) {
        this.invalidate(
          "monthlyAllocations",
          "Duplicate monthly allocations are not allowed."
        );
      }
  
      const monthlyTotal = this.monthlyAllocations.reduce(
        (total, item) => total + item.amount,
        0
      );
  
      if (
        Math.abs(monthlyTotal - this.annualAllocation) > 0.01
      ) {
        this.invalidate(
          "monthlyAllocations",
          "Monthly allocations must equal the annual allocation."
        );
      }
    }
  });
  

module.exports = mongoose.model("Budget", budgetSchema);
