const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a sale name (e.g. Azadi Sale)'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  badgeText: {
    type: String,
    default: 'Limited Time Sale 🔥',
  },
  description: {
    type: String,
    default: '',
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  bannerImage: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  showOnNavbar: {
    type: Boolean,
    default: true,
  },
  navbarOrder: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Sale', saleSchema);
