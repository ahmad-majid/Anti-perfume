const express = require('express');
const router = express.Router();
const SiteConfig = require('../models/SiteConfig');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper — always return the single config doc, creating it with defaults if it doesn't exist yet
const getConfig = async () => {
  let config = await SiteConfig.findOne({ key: 'main' });
  if (!config) {
    config = await SiteConfig.create({ key: 'main' });
  }
  return config;
};

// @desc    Get site config (public — needed for announcement bar + testimonials on frontend)
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
router.put('/announcement', protect, admin, async (req, res) => {
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

// @desc    Update hero section content
// @route   PUT /api/site-config/hero
// @access  Private/Admin
router.put('/hero', protect, admin, async (req, res) => {
  try {
    const config = await getConfig();
    const { badge, headline, subheadline, description, ctaLabel, videoUrl, videoPlatform, heroProductName } = req.body;

    if (badge !== undefined)           config.hero.badge           = badge;
    if (headline !== undefined)        config.hero.headline        = headline;
    if (subheadline !== undefined)     config.hero.subheadline     = subheadline;
    if (description !== undefined)     config.hero.description     = description;
    if (ctaLabel !== undefined)        config.hero.ctaLabel        = ctaLabel;
    if (videoUrl !== undefined)        config.hero.videoUrl        = videoUrl;
    if (videoPlatform !== undefined)   config.hero.videoPlatform   = videoPlatform;
    if (heroProductName !== undefined) config.hero.heroProductName = heroProductName;

    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Replace entire testimonials array
// @route   PUT /api/site-config/testimonials
// @access  Private/Admin
router.put('/testimonials', protect, admin, async (req, res) => {
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

module.exports = router;
