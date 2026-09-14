const mongoose = require('mongoose');

const farmExpenseSchema = new mongoose.Schema(
  {
    farmerId: {
      type: String,
      required: [true, 'Farmer ID is required'],
      index: true
    },
    expenseName: {
      type: String,
      required: [true, 'Expense name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Seeds',
        'Irrigation',
        'Equipment',
        'Labour',
        'Fertilizer',
        'Pest Control',
        'Packaging',
        'Transportation',
        'Electricity',
        'Other'
      ],
      default: 'Other'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.FarmExpense || mongoose.model('FarmExpense', farmExpenseSchema);
