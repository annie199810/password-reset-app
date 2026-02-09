console.log("✅ server.js loaded");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

/* -------------------- MongoDB -------------------- */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String
});

const resetSchema = new mongoose.Schema({
  email: String,
  token: String,
  expiresAt: Date
});

const User = mongoose.model("User", userSchema);
const ResetToken = mongoose.model("ResetToken", resetSchema);

/* -------------------- Nodemailer -------------------- */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* -------------------- Routes -------------------- */

// Health check
app.get("/", (req, res) => {
  res.send("Password Reset Backend Running");
});

// Forgot Password
app.post("/api/auth/request-reset", async (req, res) => {
  console.log("🔹 Forgot password hit");

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });

    // Always return success (security)
    if (!user) {
      return res.json({
        ok: true,
        message: "If the email exists, a reset link has been sent."
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await ResetToken.deleteMany({ email });

    await ResetToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: `"Password Reset App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Link",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
      `
    });

    console.log("📧 Email sent to:", email);

    res.json({
      ok: true,
      message: "If the email exists, a reset link has been sent."
    });

  } catch (err) {
    console.error("❌ Reset error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, email, password } = req.body;

    const record = await ResetToken.findOne({ token, email });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.updateOne({ email }, { password: hashed });

    await ResetToken.deleteMany({ email });

    res.json({ ok: true, message: "Password reset successful" });

  } catch (err) {
    console.error("❌ Reset confirm error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
});

/* -------------------- Start Server -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
