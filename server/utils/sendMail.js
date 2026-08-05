const nodemailer = require("nodemailer");
const dns = require("dns");
const net = require("net");
const shared = require("nodemailer/lib/shared");

// nodemailer resolves SMTP hosts over IPv4 only, which fails on networks where
// the IPv4 route to the mail host is blocked but IPv6 works. Prefer AAAA records.
const ipv6Cache = new Map();
const originalResolveHostname = shared.resolveHostname;
shared.resolveHostname = (options, callback) => {
  if (!options.host || net.isIP(options.host)) {
    return originalResolveHostname(options, callback);
  }
  const host = options.host;
  if (ipv6Cache.has(host)) {
    return callback(null, ipv6Cache.get(host));
  }
  new dns.Resolver().resolve6(host, (err, addresses) => {
    if (!err && addresses && addresses.length) {
      const value = {
        host: addresses[0],
        servername: options.servername || host,
      };
      ipv6Cache.set(host, value);
      return callback(null, value);
    }
    return originalResolveHostname(options, callback);
  });
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});

const sendWithRetry = async (mailOptions, attempts = 3) => {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      const last = attempt === attempts;
      console.error(
        `Mail attempt ${attempt}/${attempts} failed: ${error.code || error.message}`
      );
      if (last) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

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
    const info = await sendWithRetry(mailOptions);
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
    const info = await sendWithRetry(mailOptions);
    console.log("Setup email sent: ", info.response);
  } catch (error) {
    console.error("Error sending setup mail: ", error);
  }
};

module.exports = { sendCredentialsEmail, sendSetupLinkEmail };
