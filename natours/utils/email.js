const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user(name, emailAddr), url).sendWelcome()....;

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ').at(0);
    this.url = url;
    this.from = `Naga Manoj Vedam <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1. Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );
    // 2. Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
      // html:
    };
    // 3. Create a transport and send email

    await this.newTransport().sendMail(mailOptions); // sendMail Method is from nodemailer package
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
};

// const sendEmail = async (options) => {
// 1. Create a transporter
// const transport = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: +process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
// console.log(typeof process.env.EMAIL_HOST);
// console.log(typeof process.env.EMAIL_PORT);
// console.log(typeof process.env.EMAIL_USERNAME);
// console.log(typeof process.env.EMAIL_PASSWORD);
// Looking to send emails in production? Check out our Email API/SMTP product!
// const transport = nodemailer.createTransport({
//   host: 'sandbox.smtp.mailtrap.io',
//   port: 2525,
//   auth: {
//     user: 'f4bb826692db66',
//     pass: '9998d60dbb042e',
//   },
// });
// 2. define the email options
// const mailOptions = {
//   from: 'Pushpa Raj <pushpa@rrsyndicate.com>',
//   to: options.email,
//   subject: options.subject,
//   text: options.message,
//   // html:
// };
// 3. actually send the email
// await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;
