const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Get all active sales for public/navbar
// @route   GET /api/sales/active
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const sales = await Sale.find({ isActive: true }).sort({ navbarOrder: 1, createdAt: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Fetch Active Sales Error:', error);
    res.status(500).json({ message: 'Server error retrieving active sales' });
  }
});

// @desc    Get all sales (Admin)
// @route   GET /api/sales
// @access  Public / Admin
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = {};
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    const sales = await Sale.find(query).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    console.error('Fetch Sales Error:', error);
    res.status(500).json({ message: 'Server error retrieving sales list' });
  }
});

// @desc    Get single sale by slug with associated products
// @route   GET /api/sales/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const sale = await Sale.findOne({ slug: req.params.slug });
    if (!sale) {
      return res.status(404).json({ message: 'Sale campaign not found' });
    }

    const products = await Product.find({ saleId: sale._id });
    res.json({
      sale,
      products,
    });
  } catch (error) {
    console.error('Fetch Sale Detail Error:', error);
    res.status(500).json({ message: 'Server error retrieving sale campaign' });
  }
});

// @desc    Create a new sale (Admin Only)
// @route   POST /api/sales
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, slug, badgeText, description, discountPercent, bannerImage, isActive, showOnNavbar } = req.body;

  try {
    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await Sale.findOne({ slug: generatedSlug });
    if (existing) {
      return res.status(400).json({ message: 'A sale with this name/slug already exists' });
    }

    const sale = new Sale({
      name,
      slug: generatedSlug,
      badgeText: badgeText || `${name} 🔥`,
      description,
      discountPercent: Number(discountPercent) || 0,
      bannerImage,
      isActive: isActive !== undefined ? isActive : true,
      showOnNavbar: showOnNavbar !== undefined ? showOnNavbar : true,
    });

    const createdSale = await sale.save();
    res.status(201).json(createdSale);
  } catch (error) {
    console.error('Create Sale Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a sale (Admin Only)
// @route   PUT /api/sales/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const { name, slug, badgeText, description, discountPercent, bannerImage, isActive, showOnNavbar, navbarOrder } = req.body;

    if (name) sale.name = name;
    if (slug) sale.slug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    if (badgeText !== undefined) sale.badgeText = badgeText;
    if (description !== undefined) sale.description = description;
    if (discountPercent !== undefined) sale.discountPercent = Number(discountPercent);
    if (bannerImage !== undefined) sale.bannerImage = bannerImage;
    if (showOnNavbar !== undefined) sale.showOnNavbar = showOnNavbar;
    if (navbarOrder !== undefined) sale.navbarOrder = Number(navbarOrder);

    if (isActive !== undefined) {
      sale.isActive = isActive;
      // When admin disables this sale, reset the product selection to null (0) while keeping them in their original category
      if (!isActive) {
        await Product.updateMany({ saleId: sale._id }, { $set: { saleId: null } });
      }
    }

    const updatedSale = await sale.save();
    res.json(updatedSale);
  } catch (error) {
    console.error('Update Sale Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a sale (Admin Only) — unlinks products cleanly
// @route   DELETE /api/sales/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Unlink any products assigned to this sale so they remain in their original category
    await Product.updateMany({ saleId: sale._id }, { $set: { saleId: null } });

    await Sale.deleteOne({ _id: req.params.id });
    res.json({ message: 'Sale removed successfully and associated products unlinked' });
  } catch (error) {
    console.error('Delete Sale Error:', error);
    res.status(500).json({ message: 'Server error deleting sale' });
  }
});

module.exports = router;
