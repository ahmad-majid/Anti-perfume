const mongoose = require('mongoose');

// Single-document config — always upserted with key: 'main'
const siteConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },

  announcement: {
    enabled: { type: Boolean, default: true },
    text:    { type: String, default: '🌸 Free shipping on all orders — Use code WELCOME10 for 10% off your first order!' },
    bgColor: { type: String, default: '#593530' },
    textColor: { type: String, default: '#FFFFFF' },
    link:    { type: String, default: '/shop' },
    linkLabel: { type: String, default: 'Shop Now' },
  },

  // 1. Image Banner 1 (Shown after Value Strip)
  banner1: {
    imageUrl: { type: String, default: '/images/floral_musk.jpg' },
    bgImageUrl: { type: String, default: '/images/floral_musk.jpg' },
    ctaLink:  { type: String, default: '/shop' },
    active:   { type: Boolean, default: true },
  },

  // 2. Text Promo Banner ("Scent of Elegance" - Shown before Straight from the Studio)
  textBanner: {
    tag:         { type: String, default: 'Signature Scent' },
    title:       { type: String, default: 'Scent of Elegance' },
    subtitle:    { type: String, default: 'A fragrance that stays with you long after you have gone.' },
    description: { type: String, default: 'Crafted with the rarest florals and rich amber resins. Rediscover your personal signature aroma today.' },
    ctaLabel:    { type: String, default: 'Shop Collection Now' },
    ctaLink:     { type: String, default: '/shop' },
    active:      { type: Boolean, default: true },
  },

  // 3. Image Banner 2 (Shown after Satisfied Customers)
  banner2: {
    imageUrl: { type: String, default: '/images/amber_royale.jpg' },
    bgImageUrl: { type: String, default: '/images/amber_royale.jpg' },
    ctaLink:  { type: String, default: '/shop' },
    active:   { type: Boolean, default: true },
  },

  // 4. Straight from the Studio Videos Carousel
  studioVideos: [
    {
      title:         { type: String, default: 'Customer Unboxing' },
      tag:           { type: String, default: '13,000+ CUSTOMERS!' },
      thumbnailUrl:  { type: String, default: '/images/floral_musk.jpg' },
      videoUrl:      { type: String, default: '' },
      videoPlatform: { type: String, default: 'direct', enum: ['youtube', 'vimeo', 'direct'] },
      active:        { type: Boolean, default: true },
      order:         { type: Number, default: 0 },
    },
  ],

  // 5. Satisfied Customers Testimonials with Photos & Perfume Tags
  testimonials: [
    {
      customerPhoto:  { type: String, default: '/images/rose_divine.jpg' },
      quote:          { type: String, required: true },
      author:         { type: String, required: true },
      role:           { type: String, default: 'Verified Customer' },
      rating:         { type: Number, default: 5, min: 1, max: 5 },
      perfumeVariant: { type: String, default: 'Spectra - Best Male' },
      isVerified:     { type: Boolean, default: true },
    },
  ],

  // 6. Bank Transfer Details (For Manual Payment & 5% Discount)
  bankDetails: {
    bankName:        { type: String, default: 'Meezan Bank' },
    accountTitle:    { type: String, default: 'Anti Luxury Fragrances' },
    accountNumber:   { type: String, default: '02880110596741' },
    iban:            { type: String, default: 'PK64MEZN0002880110596741' },
    instructions:    { type: String, default: 'Transfer the amount to our official bank account and send the screenshot/receipt.' },
    supportPhone:    { type: String, default: '0314-1774008' },
    discountPercent: { type: Number, default: 5 },
    active:          { type: Boolean, default: true },
  },

  // 7. Navbar Category Display Settings (Admin can show/hide categories)
  navbarCategories: [
    {
      name:      { type: String, required: true },
      isVisible: { type: Boolean, default: true },
      order:     { type: Number, default: 0 },
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('SiteConfig', siteConfigSchema);
