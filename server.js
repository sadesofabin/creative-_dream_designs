const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios"); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

app.post("/contact", async (req, res) => {
  const { from_name, from_email, message, recaptchaToken } = req.body;

  try {
    const recaptchaURL = `https://www.google.com/recaptcha/api/siteverify`;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    const response = await axios.post(
      recaptchaURL,
      new URLSearchParams({
        secret: recaptchaSecret,
        response: recaptchaToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    if (!response.data.success) {
      return res.status(400).json({ error: "reCAPTCHA verification failed" });
    }

    const mailOptions = {
      from: `"${from_name}" <${from_email}>`,
      to: process.env.TO_EMAIL,
      subject: `New Contact Message from ${from_name}`,
      text: message,
      html: `<p><strong>Name:</strong> ${from_name}</p>
             <p><strong>Email:</strong> ${from_email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
