const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
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
  const mailOptions = {
    from: 'Pushpa Raj <pushpa@rrsyndicate.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3. actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
