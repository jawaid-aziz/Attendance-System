const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Skip sending when disabled or when SMTP credentials are not configured
const shouldSend = () =>
  process.env.SKIP_EMAIL !== "true" &&
  !!process.env.EMAIL_USER &&
  !!process.env.EMAIL_PASS;

const sendCredentialsEmail = async (receiver, name, password) => {
  const mailOptions = {
    from: '"Admin" <javaidmemon24@gmail.com>',
    to: receiver,
    subject: "Your Login Credentials",
    html: `
            <h2>Welcome to the team, ${name}!</h2>
            <p>You’ve been added to the system.</p>
            <p><b>Email:</b> ${receiver}</p>
            <p><b>Password:</b> ${password}</p>
        `,
  };

  if (!shouldSend()) {
    console.log("SKIP_EMAIL: skipping credentials email to", receiver);
    return;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("Error sending mail: ", error);
  }
};

const sendSetupLinkEmail = async (receiver, name, link) => {
  const mailOptions = {
    from: '"onTime" <javaidmemon24@gmail.com>',
    to: receiver,
    subject: "Set up your onTime account",
    html: `
            <h2>Welcome to onTime, ${name}!</h2>
            <p>Your account has been created. Click the link below to set your password and access your dashboard:</p>
            <p><a href="${link}">${link}</a></p>
            <p>This link expires in 24 hours.</p>
        `,
  };

  if (!shouldSend()) {
    console.log("SKIP_EMAIL: skipping setup link email to", receiver);
    return;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Setup email sent: ", info.response);
  } catch (error) {
    console.error("Error sending setup mail: ", error);
  }
};

module.exports = { sendCredentialsEmail, sendSetupLinkEmail };
