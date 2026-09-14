const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      index: true
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    customerId: {
      type: String,
      required: true
    },
    customerName: {
      type: String,
      default: 'Customer'
    },
    farmerId: {
      type: String,
      required: true,
      index: true
    },
    farmerName: {
      type: String,
      default: 'Farmer'
    },
    productName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: 'Vegetables'
    },
    quantity: {
      type: Number,
      default: 1
    },
    totalOrderValue: {
      type: Number,
      required: true
    },
    farmerPayout: {
      type: Number,
      required: true
    },
    platformCommission: {
      type: Number,
      default: 0
    },
    deliveryCharge: {
      type: Number,
      default: 0
    },
    driverPayout: {
      type: Number,
      default: 0
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'ESCROW_HOLDING', 'DISBURSED', 'REFUNDED'],
      default: 'PAID'
    },
    financialStatus: {
      type: String,
      enum: ['SETTLED', 'PENDING', 'REFUNDED'],
      default: 'SETTLED'
    },
    orderStatus: {
      type: String,
      enum: ['PLACED', 'CONFIRMED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REFUNDED'],
      default: 'DELIVERED'
    },
    userType: {
      type: String,
      enum: ['CONSUMER', 'BULK_BUYER'],
      default: 'CONSUMER'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.FinancialTransaction || mongoose.model('FinancialTransaction', financialTransactionSchema);
