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
    ).select('_id name imageUrl price category').limit(6);
    
    res.json(products);
  } catch (error) {
    console.error('Autocomplete Error:', error);
    res.status(500).json({ message: 'Server error fetching suggestions' });
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let productsQuery = Product.find(query);

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
    const product = await Product.findById(req.params.id);

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
  const { name, description, price, imageUrl, category, stock, notes, sizes, featured } = req.body;

  try {
    const product = new Product({
      name,
      description,
      price,
      imageUrl,
      category,
      stock,
      notes,
      sizes,
      featured,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a product (Admin Only)
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, description, price, imageUrl, category, stock, notes, sizes, featured } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.imageUrl = imageUrl || product.imageUrl;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.notes = notes || product.notes;
      product.sizes = sizes || product.sizes;
      product.featured = featured !== undefined ? featured : product.featured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({ message: error.message });
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
