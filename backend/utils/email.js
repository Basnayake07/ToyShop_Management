import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or use your email provider's SMTP
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS  // your email password or app password
  }
});

export const sendEmail = async ({ to, subject, text }) => {
  const mailOptions = {
    from: `"Perera Toyland" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to supplier");
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};


