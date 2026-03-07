const { EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE } = process.env;
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

console.log(EMAIL_SERVICE, "EMAIL_SERVICE");

class EmailService {
  constructor(userEmail) {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("Email credentials are not configured");
    }

    this.to = userEmail;
    this.from = EMAIL_USER || "no-reply@replyce.com";
    // this.from = options?.senderEmail || EMAIL_USER || "no-reply@replyce.com";

    // SMTP Transporter Setup for Gmail
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Render email template using EJS
   */
  async renderTemplate(templateName, data = {}) {
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      `${templateName}.ejs`
    );
    return await ejs.renderFile(templatePath, data);
  }

  /**
   * Send email with optional HTML template & attachments
   */
  async send({ subject, message, template, templateData, attachments, senderEmail }) {
    let htmlContent = message;

    try {
      // Verify SMTP connection configuration
      await this.transporter.verify();

      if (template) {
        htmlContent = await this.renderTemplate(template, templateData);
      }

      const mailOptions = {
        // from: `Certano <${this.from}>`,
        from: `WG Tech Solutions <${senderEmail || this.from}>`,
        to: this.to,
        subject: subject,
        text: message || "",
        html: htmlContent,
        attachments: attachments || [],
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${this.to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Email sending failed: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

module.exports = EmailService;
