const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const SibApiV3Sdk = require("sib-api-v3-sdk");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("OK");
});

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  throw new Error("Brevo API key is not defined in environment variables");
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = BREVO_API_KEY;

app.post("/contact", async (req, res) => {
  const { from_name, from_email, message } = req.body;

  // Compose subject, plain text, and HTML content
  const subject = `New Contact Message from ${from_name}`;
  const html = `
    <p><strong>Name:</strong> ${from_name}</p>
    <p><strong>Email:</strong> ${from_email}</p>
    <p><strong>Message:</strong> ${message}</p>
  `;
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = {
    name: "artocea",
    email: process.env.BREVO_MAIL_SENDER_EMAIL_ID,
  };
  sendSmtpEmail.to = [{ email: process.env.TO_EMAIL }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);    
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
