const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateReview, handleValidationErrors } = require('../middleware/validators');

// GET all approved reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    const numReviews = reviews.length;
    const averageRating = numReviews > 0
      ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews
      : 0;

    res.json({ reviews, numReviews, averageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a review
router.post('/:productId', protect, validateReview, handleValidationErrors, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    await review.save();
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all reviews (Admin only)
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT toggle review approval (Admin only)
router.put('/admin/:id/approve', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    review.isApproved = !review.isApproved;
    await review.save();
    res.json({ message: 'Review approval status updated', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a review (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await review.deleteOne();
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
