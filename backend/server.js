const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/password-reset-app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Password Reset Token Schema
const passwordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

// Generate random token
const generateToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

// Routes

// 1. Request Password Reset
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`📧 Password reset requested for: ${email}`);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with this email address.' 
      });
    }

    // Generate reset token
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Save token to database
    await PasswordResetToken.create({
      userId: user._id,
      token: resetToken,
      expiresAt: expiresAt
    });

    // For testing - log the token (remove email auth issues)
    console.log(`🔗 Reset token generated: ${resetToken}`);
    console.log(`📧 Email would be sent to: ${email}`);

    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email.',
      token: resetToken // Include token for testing
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
});

// 2. Verify Reset Token
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

// 3. Reset Password
app.post('/api/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log(`🔄 Resetting password with token: ${token}`);

    // Find valid token
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

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await User.findByIdAndUpdate(resetToken.userId._id, { 
      password: hashedPassword 
    });

    // Delete used token
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

// 4. Create sample user (for testing)
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});