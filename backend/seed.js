const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Coupon = require('./models/Coupon');

dotenv.config();

const products = [
  {
    name: "Floral Musk",
    description: "An elegant, captivating essence opening with white flowers and settling into a warm, sensual base. Timeless, sophisticated, and perfect for the modern romantic.",
    price: 129.99,
    imageUrl: "/images/floral_musk.jpg",
    category: "Floral",
    rating: 4.9,
    reviewsCount: 142,
    stock: 45,
    notes: {
      top: "Jasmine, Neroli",
      middle: "Rose, Cherry Blossom",
      base: "White Musk, Vanilla, Sandalwood"
    },
    sizes: ["50ml", "100ml"],
    featured: true
  },
  {
    name: "Rose Divine",
    description: "Crafted with rare ingredients and timeless passion. A velvet infusion of Turkish rose petals surrounded by glowing spices and a deep base of precious woods.",
    price: 129.99,
    imageUrl: "/images/rose_divine.jpg",
    category: "Floral",
    rating: 4.9,
    reviewsCount: 98,
    stock: 32,
    notes: {
      top: "Turkish Rose, Saffron",
      middle: "Pink Pepper, Peony",
      base: "Patchouli, Amber, Cedarwood"
    },
    sizes: ["50ml", "100ml"],
    featured: true
  },
  {
    name: "Velvet Oud",
    description: "An intense, mysterious fusion of rare Cambodian oudwood, smoky incense, and dark amber, enveloped in soft spices and a velvet leather chord.",
    price: 149.99,
    imageUrl: "/images/velvet_oud.jpg",
    category: "Woody",
    rating: 4.8,
    reviewsCount: 114,
    stock: 24,
    notes: {
      top: "Cardamom, Incense",
      middle: "Cambodian Oud, Leather, Rose",
      base: "Amber, Vetiver, Sandalwood"
    },
    sizes: ["50ml", "100ml"],
    featured: false
  },
  {
    name: "Citrus Luxe",
    description: "A radiant, effervescent burst of Italian bergamot, sweet mandarin, and crisp green notes, blending seamlessly with an elegant, clean floral heart.",
    price: 119.99,
    imageUrl: "/images/citrus_luxe.jpg",
    category: "Citrus",
    rating: 4.7,
    reviewsCount: 86,
    stock: 60,
    notes: {
      top: "Bergamot, Grapefruit, Mandarin",
      middle: "Orange Blossom, Mint, Basil",
      base: "White Musk, Vetiver"
    },
    sizes: ["50ml", "100ml"],
    featured: false
  },
  {
    name: "Amber Royale",
    description: "Warm, opulent, and deeply comforting. A majestic blend of precious golden amber, spiced vanilla, and roasted tonka bean, supported by smooth cashmere woods.",
    price: 159.99,
    imageUrl: "/images/amber_royale.jpg",
    category: "Amber",
    rating: 4.9,
    reviewsCount: 156,
    stock: 15,
    notes: {
      top: "Cinnamon, Nutmeg",
      middle: "Golden Amber, Labdanum",
      base: "Vanilla, Tonka Bean, Cashmere Wood"
    },
    sizes: ["50ml", "100ml"],
    featured: false
  },
  {
    name: "Midnight Bloom",
    description: "A nocturnal masterpiece featuring night-blooming jasmine, dark berries, and a soft powdery heart, drying down into an addictive gourmand base.",
    price: 139.99,
    imageUrl: "/images/midnight_bloom.jpg",
    category: "Floral",
    rating: 4.6,
    reviewsCount: 72,
    stock: 20,
    notes: {
      top: "Blackberry, Plum",
      middle: "Night Jasmine, Orchid",
      base: "Gourmand Vanilla, Patchouli, Musk"
    },
    sizes: ["50ml", "100ml"],
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected. Seeding records...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing product records.');

    // Clear and insert coupons
    await Coupon.deleteMany({});
    const coupons = [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 50, maxUses: 100, isActive: true, expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
      { code: 'LUXURY20', discountType: 'fixed', discountValue: 20, minPurchase: 100, maxUses: 50, isActive: true, expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6)) }
    ];
    await Coupon.insertMany(coupons);
    console.log('Successfully seeded coupons.');

    // Insert new products
    const createdProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${createdProducts.length} perfume products.`);

    // Clear and create seed admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@anti.com' });
    if (!adminExists) {
      await User.create({
        username: 'Anti Admin',
        email: 'admin@anti.com',
        password: 'adminpassword123',
        role: 'admin',
      });
      console.log('Created default administrator account: admin@anti.com / adminpassword123');
    } else {
      console.log('Administrator account admin@anti.com already exists.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
