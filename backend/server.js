const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS FIXED: Allow ALL origins
app.use(cors({
    origin: true, // Allow ALL origins during development
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
console.log('🔗 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
});

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const resetTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Auto-delete expired tokens after 1 hour
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model('User', userSchema);
const ResetToken = mongoose.model('ResetToken', resetTokenSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Generate secure reset token
const generateResetToken = () => {
    return require('crypto').randomBytes(32).toString('hex');
};

// Initialize demo user (for testing)
const initializeDemoUser = async () => {
    try {
        const demoUser = await User.findOne({ email: 'developerannie057@gmail.com' });
        if (!demoUser) {
            const hashedPassword = await bcrypt.hash('demo123', 10);
            await User.create({
                email: 'developerannie057@gmail.com',
                password: hashedPassword,
                name: 'Annie Developer'
            });
            console.log('✅ Demo user created');
        }
    } catch (error) {
        console.log('ℹ️ Demo user already exists');
    }
};

// Routes

// 1. Password Reset Request
app.post('/api/reset-password', async (req, res) => {
    console.log('📧 Password reset request for:', req.body.email);
    
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: 'Email is required' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Security: Always return success to prevent email enumeration
        if (!user) {
            console.log('⚠️ No user found (security response)');
            return res.json({ 
                success: true,
                message: 'If the email exists, a reset link has been sent to your email address.'
            });
        }

        // Generate and store reset token
        const resetToken = generateResetToken();
        const resetTokenDoc = new ResetToken({
            token: resetToken,
            email: user.email,
            userId: user._id,
            expiresAt: new Date(Date.now() + 3600000) // 1 hour
        });

        await resetTokenDoc.save();

        // Send reset email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        
        if (process.env.NODE_ENV === 'production') {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h2>Password Reset Request</h2>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>This link expires in 1 hour.</p>
                `
            });
        } else {
            console.log('🔗 Development Reset Link:', resetLink);
        }

        console.log('✅ Reset process completed for:', user.email);
        res.json({ 
            success: true,
            message: 'Password reset link has been sent to your email address.'
        });

    } catch (error) {
        console.error('💥 Server error:', error);
        res.status(500).json({ 
            success: false,
            error: 'An error occurred while processing your request.'
        });
    }
});

// 2. Verify Reset Token
app.get('/api/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const tokenData = await ResetToken.findOne({ token });

        if (!tokenData) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or expired reset token' 
            });
        }

        if (Date.now() > tokenData.expiresAt) {
            await ResetToken.deleteOne({ token });
            return res.status(400).json({ 
                success: false,
                error: 'Reset token has expired' 
            });
        }

        res.json({ 
            success: true,
            email: tokenData.email
        });

    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error verifying token' 
        });
    }
});

// 3. Reset Password Confirmation
app.post('/api/reset-password-confirm', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Token and new password are required' 
            });
        }

        const tokenData = await ResetToken.findOne({ token });
        if (!tokenData) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid or expired reset token' 
            });
        }

        // Update user password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(tokenData.userId, { 
            password: hashedPassword 
        });

        // Delete used token
        await ResetToken.deleteOne({ token });

        console.log('✅ Password reset successful for:', tokenData.email);
        res.json({ 
            success: true,
            message: 'Password has been reset successfully.'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error resetting password' 
        });
    }
});

// 4. User Registration (for demo)
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name
        });

        await user.save();
        
        res.json({ 
            success: true,
            message: 'User registered successfully'
        });

    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: 'Error creating user: ' + error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Initialize demo user and start server
initializeDemoUser().then(() => {
    // Add error handling
    app.on('error', (error) => {
        console.error('❌ Server error:', error);
    });

    app.on('listening', () => {
        console.log('✅ Server successfully bound to port:', PORT);
    });

    // Bind to all network interfaces
    app.listen(PORT, '0.0.0.0', () => {
        console.log('\n🚀 Professional Password Reset Server Started');
        console.log('📍 Port:', PORT);
        console.log('🌐 Frontend URL:', process.env.FRONTEND_URL);
        console.log('💾 Database:', mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...');
        console.log('========================================\n');
    });
});