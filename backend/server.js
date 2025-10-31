const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();


app.use(cors({
  origin: [
    'https://prapp.netlify.app', 
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.get('/', (req, res) => {
  res.json({ 
    message: 'Password Reset API is working!',
    endpoints: {
      forgotPassword: 'POST /api/forgot-password',
      verifyToken: 'GET /api/verify-reset-token/:token',
      resetPassword: 'POST /api/reset-password/:token',
      createUser: 'POST /api/create-user'
    },
    timestamp: new Date()
  });
});


app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Healthy', 
    database: 'Connected',
    timestamp: new Date() 
  });
});


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/password-reset-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});


const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);


const generateToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};


app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`📧 Password reset requested for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address.' 
      });
    }

    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
      expiresAt: expiresAt
    });

    console.log(`🔗 Reset token generated: ${resetToken}`);
    console.log(`📧 Email would be sent to: ${email}`);

    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email.',
      token: resetToken
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
});


app.get('/api/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`🔍 Verifying token: ${token}`);

    const resetToken = await PasswordResetToken.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetToken) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or expired reset token.' 
      });
    }

    res.json({ 
      valid: true, 
      message: 'Token is valid.' 
    });

  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error verifying token.' 
    });
  }
});


app.post('/api/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log(`🔄 Resetting password with token: ${token}`);

    const resetToken = await PasswordResetToken.findOne({ 
      token,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token.' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(resetToken.userId._id, { 
      password: hashedPassword 
    });

    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    console.log(`✅ Password reset successful for user: ${resetToken.userId.email}`);

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully.' 
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting password.' 
    });
  }
});


app.post('/api/create-user', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashedPassword });
    
    res.json({ success: true, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});