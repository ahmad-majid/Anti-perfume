const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Helper — always return the single config doc, creating it with defaults if it doesn't exist yet
const getConfig = async () => {
  let config = await SiteConfig.findOne({ key: 'main' });
  if (!config) {
    config = await SiteConfig.create({ key: 'main' });
  }
  return config;
};

// @desc    Get complete site config (public)
// @route   GET /api/site-config
// @access  Public
router.get('/', async (req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update announcement settings
// @route   PUT /api/site-config/announcement
// @access  Private/Admin
router.put('/announcement', protect, adminOnly, async (req, res) => {
  try {
    const config = await getConfig();
    const { enabled, text, bgColor, textColor, link, linkLabel } = req.body;

    if (enabled !== undefined)   config.announcement.enabled   = enabled;
    if (text !== undefined)      config.announcement.text      = text;
    if (bgColor !== undefined)   config.announcement.bgColor   = bgColor;
    if (textColor !== undefined) config.announcement.textColor = textColor;
    if (link !== undefined)      config.announcement.link      = link;
    if (linkLabel !== undefined) config.announcement.linkLabel = linkLabel;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update Banners (Banner 1 Image + Text Banner + Banner 2 Image)
// @route   PUT /api/site-config/banners
// @access  Private/Admin
router.put('/banners', protect, adminOnly, async (req, res) => {
  try {
    const config = await getConfig();
    const { banner1, banner2, textBanner } = req.body;

    if (banner1) {
      config.banner1 = { ...(config.banner1 ? config.banner1.toObject() : {}), ...banner1 };
    }
    if (banner2) {
      config.banner2 = { ...(config.banner2 ? config.banner2.toObject() : {}), ...banner2 };
    }
    if (textBanner) {
      config.textBanner = { ...(config.textBanner ? config.textBanner.toObject() : {}), ...textBanner };
    }

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update Straight from the Studio Videos array
// @route   PUT /api/site-config/studio-videos
// @access  Private/Admin
router.put('/studio-videos', protect, adminOnly, async (req, res) => {
  try {
    const { studioVideos } = req.body;
    if (!Array.isArray(studioVideos)) {
      return res.status(400).json({ message: 'studioVideos must be an array' });
    }
    const config = await getConfig();
    config.studioVideos = studioVideos;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update Testimonials array with customer photos and variant tags
// @route   PUT /api/site-config/testimonials
// @access  Private/Admin
router.put('/testimonials', protect, adminOnly, async (req, res) => {
  try {
    const { testimonials } = req.body;
    if (!Array.isArray(testimonials)) {
      return res.status(400).json({ message: 'testimonials must be an array' });
    }
    const config = await getConfig();
    config.testimonials = testimonials;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update Bank Transfer details
// @route   PUT /api/site-config/bank-details
// @access  Private/Admin
router.put('/bank-details', protect, adminOnly, async (req, res) => {
  try {
    const config = await getConfig();
    const { bankName, accountTitle, accountNumber, iban, instructions, supportPhone, discountPercent, active } = req.body;

    if (bankName !== undefined)        config.bankDetails.bankName        = bankName;
    if (accountTitle !== undefined)    config.bankDetails.accountTitle    = accountTitle;
    if (accountNumber !== undefined)   config.bankDetails.accountNumber   = accountNumber;
    if (iban !== undefined)            config.bankDetails.iban            = iban;
    if (instructions !== undefined)    config.bankDetails.instructions    = instructions;
    if (supportPhone !== undefined)    config.bankDetails.supportPhone    = supportPhone;
    if (discountPercent !== undefined) config.bankDetails.discountPercent = Number(discountPercent);
    if (active !== undefined)          config.bankDetails.active          = active;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update Navbar Categories visibility
// @route   PUT /api/site-config/navbar-categories
// @access  Private/Admin
router.put('/navbar-categories', protect, adminOnly, async (req, res) => {
  try {
    const { navbarCategories } = req.body;
    if (!Array.isArray(navbarCategories)) {
      return res.status(400).json({ message: 'navbarCategories must be an array' });
    }
    const config = await getConfig();
    config.navbarCategories = navbarCategories;
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
