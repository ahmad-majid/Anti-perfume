const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  maxUses: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', couponSchema);
