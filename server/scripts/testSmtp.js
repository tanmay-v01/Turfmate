require('dotenv').config();
const nodemailer = require('nodemailer');
const config = require('../lib/config');

async function testSmtp() {
  console.log('Testing SMTP Configuration...');
  console.log('Host:', config.smtpHost);
  console.log('Port:', config.smtpPort);
  console.log('User:', config.smtpUser ? '***' : 'Not Set');

  if (!config.smtpHost || !config.smtpUser) {
    console.error('Error: SMTP_HOST or SMTP_USER is missing in your .env file or environment.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });

  try {
    await transporter.verify();
    console.log('? SMTP Connection Successful!');
    
    console.log('Sending test email to', config.smtpFrom, '...');
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to: config.smtpFrom,
      subject: 'Turfmate SMTP Test',
      text: 'If you are reading this, your SMTP configuration for Turfmate is working perfectly!',
    });
    console.log('? Test email sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('? SMTP Connection Failed:', err.message);
  }
  process.exit(0);
}

testSmtp();
