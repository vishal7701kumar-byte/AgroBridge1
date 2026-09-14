const mongoose = require('mongoose');

const platformExpenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      required: [true, 'Expense name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: [
        'Server Infrastructure',
        'AI Services',
        'Development',
        'Marketing',
        'Employee / Support',
        'Map Services',
        'Maintenance',
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

module.exports = mongoose.models.PlatformExpense || mongoose.model('PlatformExpense', platformExpenseSchema);
