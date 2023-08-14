const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: 'scoutcamp.notifications@gmail.com',
    pass: 'pqilotklzbslhyry'
  }
});

transporter.verify().then(() => console.log("Mailer: Ready for send emails"));

module.exports = transporter;