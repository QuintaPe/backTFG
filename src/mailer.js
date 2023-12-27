import nodemailer from "nodemailer";
import i18n from 'i18n';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify().then(() => console.log("Mailer: Ready for send emails"));

const emailTemplate = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>{subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff;">
        <tr>
          <td bgcolor="#798777" style="padding: 20px; text-align: center; color: #fff;">
            <h1 style="margin: 0;">Scoutcamp</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <h2>{helloMessage},</h2>
            <p>{emailMessage}</p>
            <p>{teamMessage}</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#798777" style="padding: 20px; text-align: center;">
            <p style="margin: 0; color: #fff;">Este correo electrónico es informativo y no requiere respuesta.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

export async function sendEmail(user, subject, html) {
  i18n.setLocale(user.lang);
  return transporter.sendMail({
    from: '"Scoutcamp" <scoutcamp.notifications@gmail.com>',
    to: user.email,
    subject: subject,
    html: emailTemplate
      .replace('{subject}', subject)
      .replace('{helloMessage}', i18n.__mf('hello', { name: user.attributes.firstname }))
      .replace('{emailMessage}', html)
      .replace('{teamMessage}', i18n.__('theScoutcampTeam')),
  });
}