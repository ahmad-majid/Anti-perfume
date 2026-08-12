const mongoose = require('mongoose');

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
  imageUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['Floral', 'Woody', 'Citrus', 'Amber', 'Fresh'],
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
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
