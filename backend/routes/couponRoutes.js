const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateCoupon, handleValidationErrors } = require('../middleware/validators');

// GET all coupons (Admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create coupon (Admin)
router.post('/', protect, admin, validateCoupon, handleValidationErrors, async (req, res) => {
  try {
    const couponExists = await Coupon.findOne({ code: req.body.code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      ...req.body,
      code: req.body.code.toUpperCase()
    });
    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update coupon (Admin)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    Object.assign(coupon, req.body);
    if (req.body.code) coupon.code = req.body.code.toUpperCase();
    
    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE delete coupon (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    await coupon.deleteOne();
    res.json({ message: 'Coupon removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST validate coupon (Protected)
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} required` });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
    }

    // Don't discount more than the subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    res.json({
      discountAmount,
      couponCode: coupon.code,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
