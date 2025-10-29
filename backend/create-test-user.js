const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = mongoose.model('User', new mongoose.Schema({
      email: { type: String, unique: true },
      password: String
    }));

   
    await User.deleteOne({ email: 'test@example.com' });

    const hashedPassword = await bcrypt.hash('Test123!', 12);
    await User.create({
      email: 'test@example.com',
      password: hashedPassword
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: Test123!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();