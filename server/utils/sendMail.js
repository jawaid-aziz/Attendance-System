const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});

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

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
    } catch (error) {
        console.error("Error sending mail: ", error);
    }
};

module.exports = sendCredentialsEmail;