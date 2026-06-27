const nodemailer = require('nodemailer');
const config = require('../lib/config');

let transporter = null;

function getTransporter() {
  if (!transporter && config.smtpHost && config.smtpUser) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return false;
  }

  try {
    const info = await mailer.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Error] Failed to send to ${to}:`, error.message);
    return false;
  }
}

async function sendOtpEmail(to, otp) {
  const subject = 'Your Turfmate Verification Code';
  const text = `Your OTP for Turfmate is ${otp}. It is valid for 5 minutes.`;
  const html = `<p>Your OTP for Turfmate is <strong>${otp}</strong>.</p><p>It is valid for 5 minutes.</p>`;
  return sendEmail({ to, subject, text, html });
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  getTransporter,
};
