const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Send a verification code to the user's email
   * @param {string} email - Recipient's email address
   * @param {string} code - Verification code
   * @param {string} type - Type of verification ('email_verification' or 'password_reset')
   */
  async sendVerificationCode(email, code, type) {
    const subject = type === 'email_verification' ? 'Email Verification Code' : 'Password Reset Code';
    const text = `Your verification code is: ${code}. It will expire in 5 minutes.`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
