const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const { orderItems, shippingAddress, totalAmount, stripePaymentIntentId } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  try {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalAmount,
      stripePaymentIntentId,
      isPaid: true,
      paidAt: Date.now(),
      statusHistory: [{ status: 'Processing', timestamp: Date.now() }],
    });

    const createdOrder = await order.save();

    // Deduct stock for each purchased item
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Increment coupon usedCount if a coupon was applied
    if (req.body.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: req.body.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: 'Failed to record the order details' });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch My Orders Error:', error);
    res.status(500).json({ message: 'Server error retrieving your orders' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (order) {
      // Allow only the owner or an admin to access the order details
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: not your order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Fetch Order Detail Error:', error);
    res.status(500).json({ message: 'Server error retrieving order details' });
  }
});

// @desc    Get all orders (Admin Only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'username email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Fetch All Orders Error:', error);
    res.status(500).json({ message: 'Server error retrieving all orders' });
  }
});

// @desc    Update order status (Admin Only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({ status, timestamp: Date.now() });
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
});

module.exports = router;
