const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all customers with order count and total spend
// @route   GET /api/admin/customers
// @access  Private/Admin
router.get('/customers', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });

    // Attach order stats for each user
    const customersWithStats = await Promise.all(
      users.map(async (u) => {
        const orders = await Order.find({ user: u._id }).sort({ createdAt: -1 });
        const totalSpent = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        return {
          _id: u._id,
          username: u.username,
          email: u.email,
          createdAt: u.createdAt,
          orderCount: orders.length,
          totalSpent,
          orders,
        };
      })
    );

    res.json(customersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    // Only count real customers, not admin accounts, so this matches the
    // Customers tab (which already correctly filters by role: 'user').
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();

    const orders = await Order.find({ isPaid: true });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const recentOrders = await Order.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly Sales for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          isPaid: true,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      monthlySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;