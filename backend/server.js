const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://prapp.netlify.app', 
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-netlify-app.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Password Reset API is working!',
    endpoints: {
      forgotPassword: 'POST /api/forgot-password',
      verifyToken: 'GET /api/verify-reset-token/:token',
      resetPassword: 'POST /api/reset-password/:token',
      createUser: 'POST /api/create-user',
      debugResetLink: 'GET /api/debug-reset-link/:email'
    },
    timestamp: new Date()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Healthy', 
    database: 'Connected',
    timestamp: new Date() 
  });
});

// MongoDB connection
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

const User = mongoose.model('User', userSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

// Generate random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Email transporter setup (for production)
const createTransporter = () => {
  // If email credentials are provided, use real email service
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // For development - log to console instead
    console.log('📧 Email credentials not set. Emails will be logged to console.');
    return null;
  }
};

const transporter = createTransporter();

// Send reset email
const sendResetEmail = async (email, resetUrl) => {
  if (!transporter) {
    // Log email details to console for development
    console.log('📧 RESET EMAIL (Development Mode):');
    console.log(`   To: ${email}`);
    console.log(`   Subject: Password Reset Request`);
    console.log(`   Reset Link: ${resetUrl}`);
    console.log('   --- Email would be sent in production ---');
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the link below to set a new password:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Your Password
          </a>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Forgot Password endpoint
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

    // Create reset URL for your frontend
    const resetUrl = `https://prapp.netlify.app/reset-password?token=${resetToken}`;
    
    console.log(`🔗 Reset token generated: ${resetToken}`);
    console.log(`🔗 Reset URL: ${resetUrl}`);

    // Send email (or log to console in development)
    const emailSent = await sendResetEmail(email, resetUrl);

    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email.',
      token: resetToken,
      resetUrl: emailSent ? undefined : resetUrl // Include URL if email not actually sent
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
});

// DEBUG ENDPOINT - Get reset link without email
app.get('/api/debug-reset-link/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`🔧 DEBUG: Generating reset link for: ${email}`);

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

    // Create the actual reset link for your Netlify frontend
    const resetUrl = `https://prapp.netlify.app/reset-password?token=${resetToken}`;
    
    console.log(`🔗 DEBUG Reset Link: ${resetUrl}`);

    res.json({ 
      success: true, 
      message: 'Reset link generated for testing',
      resetUrl: resetUrl,
      token: resetToken,
      expiresAt: expiresAt,
      instructions: 'Use this link to test password reset: ' + resetUrl
    });

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating reset link' 
    });
  }
});

// Verify reset token
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
      message: 'Token is valid.',
      email: resetToken.userId.email
    });

  } catch (error) {
    console.error('❌ Verify token error:', error);
    res.status(500).json({ 
      valid: false, 
      message: 'Error verifying token.' 
    });
  }
});

// Reset password
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

// Create user
app.post('/api/create-user', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email.' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hashedPassword });
    
    res.json({ 
      success: true, 
      user: { id: user._id, email: user.email } 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all users (for debugging)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔧 Debug endpoint: GET /api/debug-reset-link/:email`);
  console.log(`📧 Email mode: ${transporter ? 'Production' : 'Development (console log)'}`);
});