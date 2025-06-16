const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting - 10 emails per 15 minutes per IP
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Prea multe cereri de trimitere email. Încearcă din nou în 15 minute.'
  }
});

// Email validation schema
const emailSchema = Joi.object({
  to: Joi.string().email().required(),
  subject: Joi.string().min(1).max(200).required(),
  text: Joi.string().optional(),
  html: Joi.string().optional(),
  from: Joi.string().email().optional()
}).or('text', 'html'); // At least one of text or html is required

// Create transporter
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT) || 587;
  const encryption = process.env.SMTP_ENCRYPTION || 'tls';
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: port,
    secure: port === 465 || encryption === 'ssl', // true for 465/SSL, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      // Don't fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Email server is running',
    timestamp: new Date().toISOString()
  });
});

// Send email endpoint
app.post('/send-email', emailLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Date de intrare invalide',
        details: error.details.map(detail => detail.message)
      });
    }

    const { to, subject, text, html, from } = value;

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Configurația SMTP nu este completă'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    // Email options
    const mailOptions = {
      from: from || process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`Email sent successfully to ${to}: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Email trimis cu succes',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    
    let errorMessage = 'Eroare la trimiterea email-ului';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Autentificare eșuată. Verifică credențialele SMTP.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Nu se poate conecta la serverul SMTP.';
    } else if (error.code === 'EMESSAGE') {
      errorMessage = 'Mesajul email este invalid.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Eroare internă a serverului'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint-ul nu a fost găsit'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server-ul de email rulează pe portul ${PORT}`);
  console.log(`📧 Endpoint pentru trimitere email: POST http://localhost:${PORT}/send-email`);
  console.log(`❤️  Health check: GET http://localhost:${PORT}/health`);
});

module.exports = app;
