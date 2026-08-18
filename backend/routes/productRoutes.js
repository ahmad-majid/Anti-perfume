const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Get product search autocomplete suggestions
// @route   GET /api/products/search/autocomplete
// @access  Public
router.get('/search/autocomplete', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const products = await Product.find(
      { name: { $regex: q, $options: 'i' } }
    ).select('_id name imageUrl hoverImageUrl price category originalPrice').limit(6);

    res.json(products);
  } catch (error) {
    console.error('Autocomplete Error:', error);
    res.status(500).json({ message: 'Server error fetching suggestions' });
  }
});

// @desc    Get all products (supports category, saleId, search, and sort filters)
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, saleId, search, sort } = req.query;
    let query = {};

    // Filter by category (case-insensitive trimmed match)
    if (category && category !== 'All' && category !== 'undefined') {
      const cleanCat = category.trim();
      query.category = { $regex: new RegExp(`^${cleanCat}$`, 'i') };
    }

    // Filter by saleId
    if (saleId && saleId !== 'All' && saleId !== 'undefined') {
      query.saleId = saleId;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let productsQuery = Product.find(query).populate('saleId', 'name slug badgeText discountPercent isActive');

    // Sorting
    if (sort) {
      if (sort === 'price-low') {
        productsQuery = productsQuery.sort({ price: 1 });
      } else if (sort === 'price-high') {
        productsQuery = productsQuery.sort({ price: -1 });
      } else if (sort === 'rating') {
        productsQuery = productsQuery.sort({ rating: -1 });
      } else {
        productsQuery = productsQuery.sort({ createdAt: -1 });
      }
    } else {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    const products = await productsQuery;
    res.json(products);
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Server error retrieving products list' });
  }
});

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('saleId', 'name slug badgeText discountPercent isActive');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Fetch Product Detail Error:', error);
    res.status(500).json({ message: 'Server error retrieving product details' });
  }
});

// @desc    Create a new product (Admin Only)
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description, price, originalPrice, imageUrl, hoverImageUrl, category, saleId, stock, notes, sizes, featured } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      originalPrice: originalPrice || null,
      imageUrl,
      hoverImageUrl: hoverImageUrl || imageUrl,
      category,
      saleId: saleId || null,
      stock,
      notes,
      sizes,
      featured,
    });

    const createdProduct = await product.save();
    const populated = await Product.findById(createdProduct._id).populate('saleId', 'name slug badgeText');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a product (Admin Only)
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, description, price, originalPrice, imageUrl, hoverImageUrl, category, saleId, stock, notes, sizes, featured } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
      product.imageUrl = imageUrl || product.imageUrl;
      product.hoverImageUrl = hoverImageUrl !== undefined ? hoverImageUrl : product.hoverImageUrl;
      product.category = category || product.category;
      product.saleId = saleId !== undefined ? (saleId || null) : product.saleId;
      product.stock = stock !== undefined ? stock : product.stock;
      product.notes = notes || product.notes;
      product.sizes = sizes || product.sizes;
      product.featured = featured !== undefined ? featured : product.featured;

      const updatedProduct = await product.save();
      const populated = await Product.findById(updatedProduct._id).populate('saleId', 'name slug badgeText');
      res.json(populated);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Submit a review for a product
// @route   POST /api/products/:id/reviews
// @access  Public
router.post('/:id/reviews', async (req, res) => {
  const { name, rating, comment, variant } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5 stars' });
    }

    if (!name || !comment) {
      return res.status(400).json({ message: 'Please provide your name and review comment' });
    }

    const review = {
      name: name.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      variant: variant || '100ml',
      isVerified: true,
      createdAt: new Date(),
    };

    product.reviews.unshift(review);
    product.reviewsCount = product.reviews.length;
    product.rating = Number(
      (product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1)
    );

    await product.save();
    res.status(201).json({ message: 'Review submitted successfully', product });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ message: 'Server error submitting review' });
  }
});

// @desc    Delete a product (Admin Only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product successfully removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete Product Error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

module.exports = router;
