const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { protect } = require('../middleware/authMiddleware');

// GET user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    res.json(wishlist.products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add product to wishlist
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      }
    }
    await wishlist.save();
    res.json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }
    res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
