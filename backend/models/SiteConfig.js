const mongoose = require('mongoose');

// Single-document config — always upserted with key: 'main'
const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },

  announcement: {
    enabled: { type: Boolean, default: false },
    text:    { type: String, default: '🌸 Free shipping on orders over $99 — Use code WELCOME10 for 10% off your first order!' },
    bgColor: { type: String, default: '#593530' },
    textColor: { type: String, default: '#FFFFFF' },
    link:    { type: String, default: '' },
    linkLabel: { type: String, default: 'Shop Now' },
  },

  testimonials: {
    type: [
      {
        quote:    { type: String, required: true },
        author:   { type: String, required: true },
        role:     { type: String, default: 'Verified Customer' },
        rating:   { type: Number, default: 5, min: 1, max: 5 },
      },
    ],
    default: [
      {
        quote:  'Anti perfumes are truly exceptional. The scent lasts all day long and I always receive compliments! Floral Musk is my signature fragrance.',
        author: 'Sophia M.',
        role:   'Verified Customer',
        rating: 5,
      },
      {
        quote:  'Velvet Oud is absolutely divine — rich, mysterious, and long-lasting. I get stopped and asked what I\'m wearing every single time.',
        author: 'James K.',
        role:   'Verified Customer',
        rating: 5,
      },
      {
        quote:  'The packaging alone feels like a gift. Amber Royale is warm, luxurious and perfect for evenings. Will absolutely reorder.',
        author: 'Layla R.',
        role:   'Premium Member',
        rating: 5,
      },
    ],
  },

  // Hero section — editable from admin dashboard
  hero: {
    badge:       { type: String, default: 'Luxury Collection' },
    headline:    { type: String, default: 'Elegance' },
    subheadline: { type: String, default: 'in Bloom' },
    description: { type: String, default: 'Experience timeless luxury perfumes crafted with passion and elegance, designed to leave a lasting impression.' },
    ctaLabel:    { type: String, default: 'Explore Collection' },
    videoUrl:    { type: String, default: '' },
    // 'youtube' | 'vimeo' | 'direct' — determines embed strategy
    videoPlatform: { type: String, default: 'youtube', enum: ['youtube', 'vimeo', 'direct'] },
    heroProductName: { type: String, default: '' }, // override which product shows in hero image
  },
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
