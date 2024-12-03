// server.js
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email endpoint (for appointment updates)
app.post("/send-update-email", (req, res) => {
  const { email, appointmentDate, doctorName, status, reason } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Appointment Update - ${doctorName}`,
    text: `Dear Patient,

Your appointment with Dr. ${doctorName} has been updated.
Appointment Date: ${appointmentDate}
Status: ${status}
Reason: ${reason}

Best regards,
Your Medical Practice`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent: " + info.response);
    res.status(200).send("Email sent successfully");
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
