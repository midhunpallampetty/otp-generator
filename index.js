require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Max 20 requests per minute per IP
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// OTP Generator
function generateOTP(type = "number", length = 6, customChars = '') {
  let chars = '';
  if (type === 'number') chars = '0123456789';
  else if (type === 'string') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  else if (type === 'alphanumeric') chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  else if (type === 'custom') chars = customChars;

  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
}

// Health check route
app.get('/', (req, res) => {
  res.send('🎉 OTP Generator API is running!');
});

// Generate OTP route
app.get('/generate-otp', (req, res) => {
  const { type = 'number', length = 6, chars = '' } = req.query;
  const otpLength = parseInt(length);

  // Basic input validation
  if (isNaN(otpLength) || otpLength <= 0 || otpLength > 100) {
    return res.status(400).json({ error: 'Invalid length. Must be a number between 1 and 100.' });
  }

  const allowedTypes = ['number', 'string', 'alphanumeric', 'custom'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Must be one of: ${allowedTypes.join(', ')}` });
  }

  if (type === 'custom' && !chars) {
    return res.status(400).json({ error: 'Custom type requires chars to be provided.' });
  }

  const otp = generateOTP(type, otpLength, chars);

  res.json({
    otp,
    length: otpLength,
    type,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 OTP API running at http://localhost:${PORT}`);
});
