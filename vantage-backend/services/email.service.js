import { transporter } from '../config/email.js';

export const sendWelcome = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Vantage Impact!',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>Get started by submitting your golf scores and choosing a charity to support.</p>
      <p>Visit your dashboard: ${process.env.CLIENT_URL}/dashboard</p>
      <br/>
      <p>Best regards,<br/>Vantage Impact Team</p>
    `,
  };
  
  return transporter.sendMail(mailOptions);
};

export const sendDrawResult = async (user, draw, matchCount) => {
  const tier = matchCount >= 5 ? '5-Match' : matchCount >= 4 ? '4-Match' : matchCount >= 3 ? '3-Match' : 'No Match';
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Draw Results - ${draw.month}`,
    html: `
      <h2>Draw Results for ${draw.month}</h2>
      <p>Hi ${user.name},</p>
      <p>Your match tier: <strong>${tier}</strong></p>
      <p>Matched numbers: ${draw.numbers.join(', ')}</p>
      <p>Check your dashboard for more details.</p>
      <br/>
      <p>Best regards,<br/>Vantage Impact Team</p>
    `,
  };
  
  return transporter.sendMail(mailOptions);
};

export const sendWinnerAlert = async (user, winner) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Congratulations! You won £${winner.prizeAmount}`,
    html: `
      <h2>Congratulations, ${user.name}!</h2>
      <p>You have won <strong>£${winner.prizeAmount}</strong> in the ${winner.tier} tier!</p>
      <p>Please upload proof of your golf score in your dashboard to claim your prize.</p>
      <p>Visit: ${process.env.CLIENT_URL}/dashboard/winners</p>
      <br/>
      <p>Best regards,<br/>Vantage Impact Team</p>
    `,
  };
  
  return transporter.sendMail(mailOptions);
};

export const sendPaymentConfirmation = async (user, winner) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Payment Confirmed - £${winner.prizeAmount}`,
    html: `
      <h2>Payment Confirmation</h2>
      <p>Hi ${user.name},</p>
      <p>Your prize of <strong>£${winner.prizeAmount}</strong> has been paid!</p>
      <p>It should appear in your account within 1-2 business days.</p>
      <br/>
      <p>Best regards,<br/>Vantage Impact Team</p>
    `,
  };
  
  return transporter.sendMail(mailOptions);
};
