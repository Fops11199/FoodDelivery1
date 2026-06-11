const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  originalAmount: {
    type: Number
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  coupon: {
    type: Object,
    default: null
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  deliveryZone: {
    type: String,
    default: null
  },
  deliveryTimeSlot: {
    type: Object,
    default: null
  },
  deliveryDate: {
    type: String
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 0
  },
  taxName: {
    type: String,
    default: "No Tax"
  },
  address: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    default: "Food Processing"
  },
  date: {
    type: Date,
    default: Date.now
  },
  payment: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    default: "Mobile Money Transfer"
  },
  paymentStatus: {
    type: String,
    default: "Pending Verification"
  },
  adminNote: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
