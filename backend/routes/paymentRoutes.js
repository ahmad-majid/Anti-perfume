const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51Rmj3GGhXALDa0caVpsSPsxOGzMGp66ej9z5lI1Tuqsavev8l33OnBDRnmnyexAsbpFkBwQRfxbORISSiZUZJX5000aw9xsWFT');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create a Stripe Payment Intent
// @route   POST /api/payment/create-intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart items are missing' });
  }

  try {
    let subtotal = 0;

    // Verify prices on server to prevent tampering
    for (const item of cartItems) {
      const dbProduct = await Product.findById(item._id || item.product);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      subtotal += dbProduct.price * item.quantity;
    }

    // Apply free shipping rule (> $99 from design)
    const shipping = subtotal >= 99 ? 0 : 15;
    const totalAmount = subtotal + shipping;

    // Create payment intent with amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      totalAmount,
      subtotal,
      shipping,
    });
  } catch (error) {
    console.error('Create Payment Intent Error:', error);
    res.status(500).json({ message: 'Stripe Payment Intent generation failed' });
  }
});

module.exports = router;
