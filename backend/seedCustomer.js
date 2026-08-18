const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const seedCustomer = async () => {
  try {
    // Attempt connection
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://am6903999_db_user:avNljVaNt6hw407T@cluster0.gjccgwc.mongodb.net', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const email = 'customer@test.com';
    const password = 'password123';

    // Delete existing user if it exists to fix the double-hashing issue
    await User.deleteOne({ email });
    console.log('Cleaned up old test account if it existed.');

    // Create new user using the actual schema to leverage the pre-save hook
    const user = new User({
      username: 'Test Customer',
      email: email,
      password: password, // Let the pre-save hook hash it
      role: 'user',
    });

    await user.save();

    console.log('Customer successfully created!');
    console.log('--------------------------------');
    console.log('Login Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------');
    console.log('You can now log in with these details.');
    process.exit();
  } catch (error) {
    console.error('Error seeding customer:', error);
    process.exit(1);
  }
};

seedCustomer();
