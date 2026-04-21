const nodemailer = require('nodemailer');
const Newsletter = require('../models/Newsletter');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

const sendAdminCredentials = async (email, username, password) => {
  const html = `
    <h1>Welcome to Your E-commerce Platform!</h1>
    <p>Your admin account has been created successfully.</p>
    <h2>Login Credentials:</h2>
    <ul>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p><strong>Important:</strong> Please change your password after first login.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Your Admin Account Credentials',
    html,
  });
};

const sendNewProductNotification = async (product) => {
  try {
    const subscribers = await Newsletter.findAll();
    
    if (subscribers.length === 0) return;
    
    const html = `
      <h1>New Product Alert! 🎉</h1>
      <h2>${product.name}</h2>
      <p><strong>${product.description_title || ''}</strong></p>
      <p>${product.description || ''}</p>
      <p><strong>Price:</strong> ${product.price} FCFA</p>
      ${product.sold_price ? `<p><strong>Sale Price:</strong> ${product.sold_price} FCFA</p>` : ''}
      <p><strong>Category:</strong> ${product.category_name || 'Uncategorized'}</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:8080'}/products/${product.id}" 
         style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
        View Product
      </a>
    `;
    
    const emailPromises = subscribers.map(subscriber => 
      sendEmail({
        to: subscriber.email,
        subject: `New Product: ${product.name}`,
        html
      }).catch(err => console.error(`Failed to send to ${subscriber.email}:`, err))
    );
    
    await Promise.all(emailPromises);
    console.log(`Newsletter sent to ${subscribers.length} subscribers`);
  } catch (error) {
    console.error('Newsletter error:', error);
  }
};

module.exports = { sendEmail, sendAdminCredentials, sendNewProductNotification };