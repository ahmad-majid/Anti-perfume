const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const SiteConfig = require('../models/SiteConfig');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @desc    Create a new order (Manual Payments: COD or Bank Transfer)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  const {
    orderItems,
    contactInfo,
    shippingAddress,
    billingAddress,
    paymentMethod,
    paymentProof,
    couponCode,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items provided' });
  }

  try {
    // 1. Verify item prices against database
    let subtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const dbProduct = await Product.findById(item.product || item._id);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      const itemPrice = dbProduct.price;
      subtotal += itemPrice * item.quantity;

      validatedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: itemPrice,
        size: item.size || '100ml',
        imageUrl: dbProduct.imageUrl,
      });
    }

    // 2. Validate and apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: new Date() },
      });

      if (coupon && subtotal >= coupon.minPurchase) {
        if (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) {
          if (coupon.discountType === 'percentage') {
            discountAmount = (subtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          // Increment coupon used count
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // 3. Bank Transfer 5% discount
    let bankDiscountAmount = 0;
    if (paymentMethod === 'Bank Transfer') {
      const siteConfig = await SiteConfig.findOne({ key: 'main' });
      const percent = siteConfig?.bankDetails?.discountPercent || 5;
      const amountAfterCoupon = Math.max(0, subtotal - discountAmount);
      bankDiscountAmount = (amountAfterCoupon * percent) / 100;
    }

    const shippingCost = 0; // Free shipping
    const totalAmount = Math.max(0, subtotal - discountAmount - bankDiscountAmount) + shippingCost;

    // 4. Initial status determination
    const initialStatus = 'Pending Confirmation';
    const initialPaymentStatus = 'Pending Verification';

    const order = new Order({
      user: req.user._id,
      orderItems: validatedItems,
      contactInfo: contactInfo || {},
      shippingAddress,
      billingAddress: billingAddress || { sameAsShipping: true },
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      paymentProof: paymentProof || {},
      paymentStatus: initialPaymentStatus,
      subtotal,
      discountAmount,
      bankDiscountAmount,
      shippingCost,
      totalAmount,
      couponCode: couponCode || null,
      status: initialStatus,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: Date.now(),
          note: paymentMethod === 'Bank Transfer'
            ? 'Order placed via Bank Transfer. Awaiting payment receipt verification by Admin.'
            : 'Order placed via Cash on Delivery (COD).',
        },
      ],
    });

    const createdOrder = await order.save();

    // Deduct stock for each purchased item
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ message: error.message || 'Failed to place the order' });
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

// @desc    Admin Update Payment Verification Status directly (Pending Verification, Approved, Rejected)
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
router.put('/:id/payment-status', protect, adminOnly, async (req, res) => {
  try {
    const { paymentStatus, note } = req.body;
    const validStatuses = ['Pending Verification', 'Approved', 'Rejected'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status provided' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;

    // Automatically synchronize order status if appropriate
    if (paymentStatus === 'Approved') {
      if (order.status === 'Pending Confirmation' || order.status === 'Cancelled') {
        order.status = 'Confirmed';
      }
    } else if (paymentStatus === 'Rejected') {
      order.status = 'Cancelled';
    }

    if (!order.statusHistory) {
      order.statusHistory = [];
    }

    order.statusHistory.push({
      status: order.status,
      timestamp: Date.now(),
      note: note || `Payment verification changed to "${paymentStatus}" by Admin`,
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update Payment Status Error:', error);
    res.status(500).json({ message: 'Server error updating payment status' });
  }
});

// @desc    Admin Approve Payment & Confirm Order
// @route   PUT /api/orders/:id/approve-payment
// @access  Private/Admin
router.put('/:id/approve-payment', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Approved';
    order.status = 'Confirmed';
    order.statusHistory.push({
      status: 'Confirmed',
      timestamp: Date.now(),
      note: 'Payment verified and approved by Administrator.',
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Approve Payment Error:', error);
    res.status(500).json({ message: 'Server error approving payment' });
  }
});

// @desc    Admin Reject Payment
// @route   PUT /api/orders/:id/reject-payment
// @access  Private/Admin
router.put('/:id/reject-payment', protect, adminOnly, async (req, res) => {
  try {
    const { note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'Rejected';
    order.status = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: Date.now(),
      note: note || 'Payment verification failed / Rejected by Administrator.',
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Reject Payment Error:', error);
    res.status(500).json({ message: 'Server error rejecting payment' });
  }
});

// @desc    Update order lifecycle status (Admin Only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending Confirmation', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory.push({
        status,
        timestamp: Date.now(),
        note: note || `Order marked as ${status}`,
      });

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
