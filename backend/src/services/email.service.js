const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // gmail account to send emails from 
        pass: process.env.EMAIL_PASSWORD, // password to that account 
      },
    });
  }

  /**
   * Send an email to the user with a link to reset their password
   * @param {string} email - The email address of the user
   * @param {string} token - The token to reset the password
   */
  async sendPasswordChangedEmail(email) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Password Has Been Changed',
      text: `Your password has been successfully updated. If you did not make this change, please contact support immediately.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
