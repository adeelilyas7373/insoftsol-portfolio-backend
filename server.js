import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import portfinder from "portfinder";

dotenv.config();

const app = express();

// Middleware - Updated CORS setup
app.use(
  cors({
    origin: ["http://localhost:5173"], // Your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Email transporterN
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Fixed API endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Message: ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// --- Use portfinder to get an available port and start the server ---
const startServer = async () => {
  const PORT = await portfinder.getPortPromise({ startPort: 5000 });
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer();
