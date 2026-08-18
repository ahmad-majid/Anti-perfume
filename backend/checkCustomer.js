const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const checkCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://am6903999_db_user:avNljVaNt6hw407T@cluster0.gjccgwc.mongodb.net/anti-perfumes', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const email = 'customer@test.com';
    const password = 'password123';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found in DB');
      process.exit();
    }
    
    console.log('User found:', user.email);
    console.log('Stored hashed password:', user.password);

    const isMatch = await user.matchPassword(password);
    console.log('Does password123 match?', isMatch);

    // Let's create a NEW user with a different email to be absolutely sure
    const user2 = new User({
      username: 'Customer Two',
      email: 'customer2@test.com',
      password: 'password123',
      role: 'user'
    });
    
    // delete if exists
    await User.deleteOne({ email: 'customer2@test.com' });
    await user2.save();
    console.log('Created customer2@test.com with password123');
    
    const user2Check = await User.findOne({ email: 'customer2@test.com' }).select('+password');
    console.log('customer2 Does password match?', await user2Check.matchPassword('password123'));
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkCustomer();
