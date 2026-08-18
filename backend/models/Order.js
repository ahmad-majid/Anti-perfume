const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      size: { type: String, required: true },
      imageUrl: { type: String, required: true },
    },
  ],
  contactInfo: {
    emailOrPhone: { type: String, default: '' },
    emailDiscounts: { type: Boolean, default: true },
  },
  shippingAddress: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    address: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
    phone: { type: String, default: '' },
  },
  billingAddress: {
    sameAsShipping: { type: Boolean, default: true },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'Pakistan' },
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery (COD)', 'Bank Transfer', 'Stripe'],
    default: 'Cash on Delivery (COD)',
  },
  paymentProof: {
    screenshotUrl: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    note: { type: String, default: '' },
  },
  paymentStatus: {
    type: String,
    enum: ['Pending Verification', 'Approved', 'Rejected'],
    default: 'Pending Verification',
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  bankDiscountAmount: {
    type: Number,
    default: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0,
  },
  couponCode: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending Confirmation',
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      note: { type: String, default: '' },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
