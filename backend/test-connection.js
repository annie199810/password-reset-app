const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔌 Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//username:password@')); // Hide password in logs
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
    
 
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      password: String
    }));
    
    console.log('✅ Database is ready!');
    
  
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

testConnection();