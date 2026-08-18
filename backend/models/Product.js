const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  variant: { type: String, default: '100ml' },
  isVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  hoverImageUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Floral', 'Woody', 'Citrus', 'Amber', 'Fresh', 'Oriental', 'Gourmand'],
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sale',
    default: null,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  reviews: [reviewSchema],
  stock: {
    type: Number,
    required: true,
    default: 50,
  },
  notes: {
    top: { type: String, required: true },
    middle: { type: String, required: true },
    base: { type: String, required: true },
  },
  sizes: {
    type: [String],
    default: ['50ml', '100ml'],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
