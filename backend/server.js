const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
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



const PORT = process.env.PORT || 5000;


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});