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

// Contact form validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().min(2).max(100).required(),
  projectType: Joi.string().valid('webapp', 'mobile', 'desktop', 'other').required(),
  budget: Joi.string().required(),
  deadline: Joi.string().required(),
  description: Joi.string().min(10).max(2000).required(),
  _subject: Joi.string().optional()
});

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

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Contact API is running',
    endpoints: {
      contact: '/api/contact',
      health: '/api/health'
    },
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

// Contact form endpoint
app.post('/api/contact', emailLimiter, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Date de intrare invalide',
        details: error.details.map(detail => detail.message)
      });
    }

    const { name, email, company, projectType, budget, deadline, description, _subject } = value;

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

    const projectTypeMap = {
      'webapp': 'Aplicație Web',
      'mobile': 'Aplicație Mobilă',
      'desktop': 'Aplicație Desktop',
      'other': 'Altele'
    };

    // 1. Send internal notification email
    const internalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">🎯 Cerere Nouă de Contact</h2>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">👤 Informații Client</h3>
            <p><strong>Nume:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Companie:</strong> ${company}</p>
          </div>

          <div style="background-color: #e8f6f3; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #27ae60; margin-top: 0;">📋 Detalii Proiect</h3>
            <p><strong>Tip Proiect:</strong> ${projectTypeMap[projectType] || projectType}</p>
            <p><strong>Buget:</strong> ${budget}</p>
            <p><strong>Deadline:</strong> ${deadline}</p>
          </div>

          <div style="background-color: #fef9e7; padding: 20px; border-radius: 8px;">
            <h3 style="color: #f39c12; margin-top: 0;">📝 Descriere Proiect</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${description}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7;">
            <p style="color: #7f8c8d; font-size: 12px;">
              📧 Email primit la: ${new Date().toLocaleString('ro-RO')}<br>
              🚀 Zaharia Company Contact System
            </p>
          </div>
        </div>
      </div>
    `;

    const internalMailOptions = {
      from: process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER,
      to: 'contact@zahariacompany.com, stefanzaharia222@gmail.com',
      subject: _subject || `Cerere nouă de contact: ${name} - ${company}`,
      html: internalHtml
    };

    // 2. Send confirmation email to client
    const clientHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin-bottom: 10px;">✅ Confirmăm primirea cererii tale!</h2>
            <p style="color: #7f8c8d;">Mulțumim pentru încrederea acordată</p>
          </div>

          <div style="background-color: #e8f6f3; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #27ae60; margin-top: 0;">Salut ${name}! 👋</h3>
            <p style="line-height: 1.6;">
              Am primit cererea ta pentru <strong>${projectTypeMap[projectType] || projectType}</strong> 
              și echipa noastră o va analiza în cel mai scurt timp.
            </p>
          </div>

          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #34495e; margin-top: 0;">📋 Rezumatul cererii tale:</h4>
            <ul style="list-style: none; padding: 0;">
              <li style="padding: 5px 0;"><strong>Companie:</strong> ${company}</li>
              <li style="padding: 5px 0;"><strong>Buget:</strong> ${budget}</li>
              <li style="padding: 5px 0;"><strong>Deadline:</strong> ${deadline}</li>
            </ul>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #856404; margin-top: 0;">⏰ Ce urmează?</h4>
            <ul style="color: #856404; line-height: 1.6;">
              <li>Analizăm cererea ta în detaliu</li>
              <li>Te contactăm în maximum <strong>24 de ore</strong></li>
              <li>Programăm o discuție pentru a înțelege mai bine nevoile tale</li>
              <li>Îți prezentăm o ofertă personalizată</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 25px;">
            <p style="color: #2c3e50; line-height: 1.6;">
              <strong>Ai întrebări urgente?</strong><br>
              📧 <a href="mailto:contact@zahariacompany.com" style="color: #3498db;">contact@zahariacompany.com</a><br>
              📱 Ne poți contacta direct pentru orice nelămurire
            </p>
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #bdc3c7;">
            <p style="color: #7f8c8d; font-size: 12px; line-height: 1.4;">
              Cu stimă,<br>
              <strong>Echipa Zaharia Company</strong><br>
              🚀 Transformăm ideile în realitate digitală
            </p>
          </div>
        </div>
      </div>
    `;

    const clientMailOptions = {
      from: process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER,
      to: email,
      subject: `Confirmare cerere - ${company} | Zaharia Company`,
      html: clientHtml
    };

    // Send both emails
    const [internalInfo, clientInfo] = await Promise.all([
      transporter.sendMail(internalMailOptions),
      transporter.sendMail(clientMailOptions)
    ]);

    console.log(`Internal notification sent: ${internalInfo.messageId}`);
    console.log(`Client confirmation sent to ${email}: ${clientInfo.messageId}`);

    res.json({
      success: true,
      message: 'Cererea a fost trimisă cu succes. Vei primi un email de confirmare în scurt timp.',
      details: {
        internalMessageId: internalInfo.messageId,
        clientMessageId: clientInfo.messageId
      }
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    let errorMessage = 'Eroare la procesarea cererii de contact';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Eroare de autentificare email. Te rugăm să încerci din nou.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Problemă de conectivitate. Te rugăm să încerci din nou.';
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
  console.log(`📝 Endpoint pentru contact: POST http://localhost:${PORT}/api/contact`);
  console.log(`❤️  Health check: GET http://localhost:${PORT}/health`);
  console.log(`❤️  API Health check: GET http://localhost:${PORT}/api/health`);
});

module.exports = app;
