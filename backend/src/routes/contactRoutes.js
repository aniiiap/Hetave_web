import express from "express";
import { Resend } from "resend";
import dotenv from "dotenv";
import Contact from "../models/Contact.js";
import { protect, admin } from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

// Initialize Resend 
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn(
    "RESEND_API_KEY is not set. Contact form emails will not be sent. Set RESEND_API_KEY in your .env to enable emails."
  );
}

// Company email (where contact form submissions go)
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "sales@hetave.co.in";

// @route   POST /api/contacts
// @desc    Submit contact form and send emails
// @access  Public
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required",
      });
    }

    // Save contact to database
    const contact = await Contact.create({
      name,
      email,
      phone: phone || "",
      message,
    });

    // Email to company (notification about new contact)
    const companyEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c; }
            .label { font-weight: bold; color: #ea580c; margin-right: 10px; }
            .message-box { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <p>You have received a new message from your website contact form.</p>
              
              <div class="info-box">
                <p><span class="label">Name:</span> ${name}</p>
                <p><span class="label">Email:</span> <a href="mailto:${email}">${email}</a></p>
                ${phone ? `<p><span class="label">Phone:</span> <a href="tel:${phone}">${phone}</a></p>` : ''}
              </div>

              <div class="message-box">
                <p><span class="label">Message:</span></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
              </div>

              <div class="footer">
                <p>This email was sent from the Hetave Enterprises contact form.</p>
                <p>Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Thank you email to sender
    const thankYouEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea580c; }
            .contact-info { background: white; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .contact-item { margin: 10px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thank You for Contacting Us!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              
              <div class="message">
                <p>Thank you for reaching out to <strong>Hetave Enterprises</strong>!</p>
                <p>We have received your message and our team will get back to you as soon as possible, typically within 24-48 hours.</p>
                <p>We appreciate your interest in our PPE products and services.</p>
              </div>

              <div class="contact-info">
                <h3 style="color: #ea580c; margin-top: 0;">In the meantime, feel free to contact us:</h3>
                <div class="contact-item">
                  <strong>📞 Phone:</strong> 
                  <a href="tel:+918095289835" style="color: #ea580c;">+91 80952 89835</a>, 
                  <a href="tel:+917624818724" style="color: #ea580c;">+91 76248 18724</a>
                </div>
                <div class="contact-item">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:sales@hetave.co.in" style="color: #ea580c;">sales@hetave.co.in</a>
                </div>
                <div class="contact-item">
                  <strong>📍 Address:</strong> 292, Rama Vihar, Bhilwara, Rajasthan - 311001
                </div>
              </div>

              <div class="footer">
                <p>Best regards,<br><strong>Hetave Enterprises Team</strong></p>
                <p style="margin-top: 20px; font-size: 11px; color: #999;">
                  This is an automated confirmation email. Please do not reply to this message.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to company (only if Resend is configured)
    if (resend) {
      try {
        await resend.emails.send({
          from: "Hetave Contact Form <sales@hetave.co.in>",
          to: COMPANY_EMAIL,
          subject: `New Contact Form Submission from ${name}`,
          html: companyEmailHtml,
        });
        console.log(`Email sent to company: ${COMPANY_EMAIL}`);
      } catch (emailError) {
        console.error("Error sending email to company:", emailError);
        // Continue even if email fails - still save the contact
      }
    }

    // Send thank you email to sender (only if Resend is configured)
    if (resend) {
      try {
        await resend.emails.send({
          from: "Hetave Enterprises <sales@hetave.co.in>",
          to: email,
          subject: "Thank You for Contacting Hetave Enterprises",
          html: thankYouEmailHtml,
        });
        console.log(`Thank you email sent to sender: ${email}`);
      } catch (emailError) {
        console.error("Error sending thank you email:", emailError);
        // Continue even if email fails - still save the contact
      }
    } else {
      console.warn("Resend not configured - emails not sent");
    }

    res.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your message. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/contacts
// @desc    Get all contact submissions (admin only)
// @access  Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    
    res.json({
      success: true,
      contacts: contacts.map((contact) => ({
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        createdAt: contact.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;

