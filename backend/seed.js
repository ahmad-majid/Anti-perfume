const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
const Coupon = require('./models/Coupon');
const Sale = require('./models/Sale');
const SiteConfig = require('./models/SiteConfig');

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected. Seeding complete records...');

    // 1. Clear existing collections
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Coupon.deleteMany({});
    await SiteConfig.deleteMany({});
    console.log('Cleared existing product, sale, coupon, and site config records.');

    // 2. Seed Sales Campaigns
    const azadiSale = await Sale.create({
      name: 'Azadi Sale',
      slug: 'azadi-sale',
      badgeText: 'Azadi Sale 🔥',
      description: 'Celebrate elegance with up to 20% off on our signature collection!',
      discountPercent: 15,
      bannerImage: '/images/amber_royale.jpg',
      isActive: true,
      showOnNavbar: true,
      navbarOrder: 1,
    });

    const summerSale = await Sale.create({
      name: 'Summer Splash',
      slug: 'summer-splash',
      badgeText: 'Summer Splash ☀️',
      description: 'Refreshing citrus and aquatic fragrances for warm summer days.',
      discountPercent: 10,
      bannerImage: '/images/citrus_luxe.jpg',
      isActive: true,
      showOnNavbar: true,
      navbarOrder: 2,
    });

    console.log('Successfully seeded sales campaigns.');

    // 3. Seed Products with Dual Images (Main + Hover Image)
    const products = [
      {
        name: "Floral Musk",
        description: "An elegant, captivating essence opening with white flowers and settling into a warm, sensual base. Timeless, sophisticated, and perfect for the modern romantic.",
        price: 129.99,
        originalPrice: 149.99,
        imageUrl: "/images/floral_musk.jpg",
        hoverImageUrl: "/images/rose_divine.jpg",
        category: "Floral",
        saleId: azadiSale._id,
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
        originalPrice: 159.99,
        imageUrl: "/images/rose_divine.jpg",
        hoverImageUrl: "/images/floral_musk.jpg",
        category: "Floral",
        saleId: azadiSale._id,
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
        originalPrice: 179.99,
        imageUrl: "/images/velvet_oud.jpg",
        hoverImageUrl: "/images/amber_royale.jpg",
        category: "Woody",
        saleId: azadiSale._id,
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
        originalPrice: 139.99,
        imageUrl: "/images/citrus_luxe.jpg",
        hoverImageUrl: "/images/floral_musk.jpg",
        category: "Citrus",
        saleId: summerSale._id,
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
        originalPrice: 189.99,
        imageUrl: "/images/amber_royale.jpg",
        hoverImageUrl: "/images/velvet_oud.jpg",
        category: "Amber",
        saleId: null,
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
        originalPrice: 165.99,
        imageUrl: "/images/midnight_bloom.jpg",
        hoverImageUrl: "/images/rose_divine.jpg",
        category: "Floral",
        saleId: null,
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

    const createdProducts = await Product.insertMany(products);
    console.log(`Successfully seeded ${createdProducts.length} dual-image perfume products.`);

    // 4. Seed Coupons
    const coupons = [
      { code: 'WELCOME10', discountType: 'percentage', discountValue: 10, minPurchase: 50, maxUses: 100, isActive: true, expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
      { code: 'BANK5', discountType: 'percentage', discountValue: 5, minPurchase: 0, maxUses: 1000, isActive: true, expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
      { code: 'LUXURY20', discountType: 'fixed', discountValue: 20, minPurchase: 100, maxUses: 50, isActive: true, expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 6)) }
    ];
    await Coupon.insertMany(coupons);
    console.log('Successfully seeded coupons.');

    // 5. Seed Site Configuration (Banners, Studio Videos, Testimonials, Bank Details, Navbar Categories)
    await SiteConfig.create({
      key: 'main',
      announcement: {
        enabled: true,
        text: '🌸 Free Shipping Across All Orders — Use Code WELCOME10 for 10% Off!',
        bgColor: '#593530',
        textColor: '#FFFFFF',
        link: '/shop',
        linkLabel: 'Shop Now',
      },
      banner1: {
        badge: 'Luxury Fragrance Collection',
        headline: 'Elegance',
        subheadline: 'in Bloom',
        description: 'Experience timeless luxury perfumes crafted with passion and elegance, designed to leave a lasting impression.',
        ctaLabel: 'Explore Collection',
        ctaLink: '/shop',
        bgImageUrl: '',
        bgType: 'image',
        videoUrl: '',
        videoPlatform: 'youtube',
        heroProductName: 'Floral Musk',
        active: true,
      },
      banner2: {
        tag: 'Signature Scent',
        title: 'Scent of Elegance',
        subtitle: 'A fragrance that stays with you long after you have gone.',
        description: 'Crafted with the rarest florals and rich amber resins. Rediscover your personal signature aroma today.',
        ctaLabel: 'Shop Collection Now',
        ctaLink: '/shop',
        bgImageUrl: '/images/amber_royale.jpg',
        bgType: 'image',
        videoUrl: '',
        active: true,
      },
      studioVideos: [
        {
          title: 'Purana USERS',
          tag: '13,000+ CUSTOMERS!',
          thumbnailUrl: '/images/velvet_oud.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoPlatform: 'youtube',
          active: true,
          order: 1,
        },
        {
          title: 'Perfumery Studio Tour',
          tag: 'SELF CONFIDENCE',
          thumbnailUrl: '/images/floral_musk.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoPlatform: 'youtube',
          active: true,
          order: 2,
        },
        {
          title: 'Customer Experience',
          tag: 'LUXURY PACKAGING',
          thumbnailUrl: '/images/rose_divine.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoPlatform: 'youtube',
          active: true,
          order: 3,
        },
        {
          title: 'Master Perfumer Scent Blend',
          tag: 'PREMIUM QUALITY',
          thumbnailUrl: '/images/amber_royale.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoPlatform: 'youtube',
          active: true,
          order: 4,
        },
      ],
      testimonials: [
        {
          customerPhoto: '/images/rose_divine.jpg',
          quote: 'This is my 2nd order with Anti perfumes, one of best and lasting fragrances with reasonable price tags, even I used Janan by J..',
          author: 'Attiq Riaz',
          role: 'Verified Buyer',
          rating: 5,
          perfumeVariant: 'Azadi Bundle — Any 3',
          isVerified: true,
        },
        {
          customerPhoto: '/images/velvet_oud.jpg',
          quote: 'I love the packaging and perfume outstanding quality. The smell stays on for days and people keep complimenting!',
          author: 'Faisal',
          role: 'Verified Buyer',
          rating: 5,
          perfumeVariant: 'Spectra — Best Male',
          isVerified: true,
        },
        {
          customerPhoto: '/images/midnight_bloom.jpg',
          quote: 'Best perfume fragrance perfect and lasting also. Best perfume fragrance perfect and lasting.',
          author: 'Nouman',
          role: 'Verified Buyer',
          rating: 5,
          perfumeVariant: 'Spectra — Best Male',
          isVerified: true,
        },
        {
          customerPhoto: '/images/amber_royale.jpg',
          quote: 'Best budget Fragrance. Amazing smell, good lasting, and people always ask which fragrance I am wearing.',
          author: 'Ahsan Abbasi',
          role: 'Verified Buyer',
          rating: 5,
          perfumeVariant: 'Spectra & Alpha Male',
          isVerified: true,
        },
      ],
      bankDetails: {
        bankName: 'Meezan Bank',
        accountTitle: 'Anti Luxury Fragrances',
        accountNumber: '02880110596741',
        iban: 'PK64MEZN0002880110596741',
        instructions: 'Transfer the amount to our Meezan Bank account and send your transfer screenshot along with your order number to our WhatsApp support.',
        supportPhone: '0314-1774008',
        discountPercent: 5,
        active: true,
      },
      navbarCategories: [
        { name: 'Floral', isVisible: true, order: 1 },
        { name: 'Woody', isVisible: true, order: 2 },
        { name: 'Citrus', isVisible: true, order: 3 },
        { name: 'Amber', isVisible: true, order: 4 },
        { name: 'Fresh', isVisible: false, order: 5 },
      ],
    });
    console.log('Successfully seeded site configuration with banners, studio videos, testimonials, bank details, and categories.');

    // 6. Admin Account
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

    console.log('All database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();
