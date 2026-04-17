"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailgun_js_1 = __importDefault(require("mailgun.js"));
const form_data_1 = __importDefault(require("form-data"));
let EmailService = EmailService_1 = class EmailService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(EmailService_1.name);
        const mailgun = new mailgun_js_1.default(form_data_1.default);
        this.mailgun = mailgun.client({
            username: "api",
            key: this.config.get("MAILGUN_API_KEY"),
        });
        this.domain = this.config.get("MAILGUN_DOMAIN");
    }
    async send(payload) {
        try {
            await this.mailgun.messages.create(this.domain, {
                from: this.config.get("MAILGUN_FROM", "TruCredit Capital <noreply@trucreditcapital.com>"),
                to: payload.to,
                subject: payload.subject,
                html: payload.html,
            });
            this.logger.log(`Email sent to ${payload.to}: ${payload.subject}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${payload.to}`, err);
        }
    }
    async sendApplicationConfirmation(borrowerEmail, borrowerName, applicationId, requestedAmount) {
        await this.send({
            to: borrowerEmail,
            subject: "Application Received: Your Funding Request with TruCredit Capital",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2744; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">TruCredit Capital</h1>
          </div>
          <div style="padding: 32px 24px; background: #f8f9fa;">
            <h2 style="color: #1a2744;">Application Received</h2>
            <p>Dear ${borrowerName},</p>
            <p>Thank you for submitting your funding request of <strong>$${Number(requestedAmount).toLocaleString()}</strong> with TruCredit Capital.</p>
            <p>Your application ID is: <strong>${applicationId}</strong></p>
            <h3 style="color: #1a2744;">Next Steps:</h3>
            <ol>
              <li>Our underwriting team will review your application within <strong>24 hours</strong>.</li>
              <li>We may reach out for additional documentation if needed.</li>
              <li>Once approved, funds are wired directly to your business account.</li>
            </ol>
            <p>If you have questions, reply to this email or call us directly.</p>
            <p style="margin-top: 32px;">— The TruCredit Capital Team</p>
          </div>
          <div style="background: #e9ecef; padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>TruCredit Capital is a commercial lender. All loans are for business purposes only. Equal Opportunity Lender.</p>
          </div>
        </div>
      `,
        });
    }
    async sendHotLeadAlert(businessName, ownerName, requestedAmount, annualRevenue, industry, phone, email) {
        const adminEmail = this.config.get("ADMIN_ALERT_EMAIL", "pabitraghara384@gmail.com");
        await this.send({
            to: adminEmail,
            subject: `🚨 NEW HOT LEAD: $${Number(requestedAmount).toLocaleString()} - ${businessName}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #d32f2f;">🚨 New Application Alert</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Business:</td><td style="padding: 8px;">${businessName}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Owner:</td><td style="padding: 8px;">${ownerName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Requested:</td><td style="padding: 8px;">$${Number(requestedAmount).toLocaleString()}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Annual Revenue:</td><td style="padding: 8px;">$${Number(annualRevenue).toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Industry:</td><td style="padding: 8px;">${industry}</td></tr>
            <tr style="background: #f5f5f5;"><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
          </table>
          <p style="margin-top: 16px;"><a href="${this.config.get(`${process.env.FRONTEND_URL}`)}/admin" style="background: #1a2744; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Dashboard</a></p>
        </div>
      `,
        });
    }
    async sendStatusUpdate(borrowerEmail, borrowerName, status, adminNote, offerDetails) {
        const statusMessages = {
            UNDER_REVIEW: "Great news! Your application is now being reviewed by our underwriting team.",
            STIPS_NEEDED: "We need additional documents to proceed with your application. Please check your portal.",
            OFFER_SENT: "Congratulations! We have a funding offer ready for you. Please review the terms.",
            DECLINED: "After careful review, we are unable to approve your application at this time.",
            FUNDED: "Your funding has been approved and processed! Funds are being wired to your account.",
        };
        const message = statusMessages[status] ||
            `Your application status has been updated to: ${status}`;
        const offerSummary = offerDetails
            ? `
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #dfe3ea; margin-top: 20px;">
              <h3 style="color: #1a2744; margin-top: 0;">Offer Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; font-weight: bold;">Offered Amount</td><td style="padding: 8px;">$${offerDetails.offeredAmount.toLocaleString()}</td></tr>
                <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Factor Rate</td><td style="padding: 8px;">${offerDetails.factorRate.toFixed(2)}</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Payment Frequency</td><td style="padding: 8px;">${offerDetails.paymentFrequency}</td></tr>
                <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Term</td><td style="padding: 8px;">${offerDetails.termMonths} months</td></tr>
                <tr><td style="padding: 8px; font-weight: bold;">Total Payback</td><td style="padding: 8px;">$${offerDetails.totalPayback.toLocaleString()}</td></tr>
                <tr style="background: #f8f9fa;"><td style="padding: 8px; font-weight: bold;">Estimated Payment</td><td style="padding: 8px;">$${offerDetails.estimatedPayment.toLocaleString()}</td></tr>
              </table>
            </div>
          `
            : "";
        await this.send({
            to: borrowerEmail,
            subject: `TruCredit Capital — Application Update: ${status.replace(/_/g, " ")}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2744; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">TruCredit Capital</h1>
          </div>
          <div style="padding: 32px 24px; background: #f8f9fa;">
            <h2 style="color: #1a2744;">Application Update</h2>
            <p>Dear ${borrowerName},</p>
            <p>${message}</p>
            ${adminNote ? `<p style="background: #fff3cd; padding: 12px; border-radius: 4px;"><strong>Note:</strong> ${adminNote}</p>` : ""}
            ${offerSummary}
            <p style="margin-top: 24px;">Questions? Contact our underwriting team directly.</p>
            <p>— The TruCredit Capital Team</p>
          </div>
          <div style="background: #e9ecef; padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>TruCredit Capital is a commercial lender. All loans are for business purposes only. Equal Opportunity Lender.</p>
          </div>
        </div>
      `,
        });
    }
    async sendStipulationRequest(borrowerEmail, borrowerName, missingItems, applicationId) {
        const itemsList = missingItems
            .map((item) => `<li style="padding: 4px 0;">${item}</li>`)
            .join("");
        const portalLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/upload-multiple/${applicationId}`;
        await this.send({
            to: borrowerEmail,
            subject: "Action Required: Additional Documents Needed — TruCredit Capital",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a2744; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">TruCredit Capital</h1>
          </div>
          <div style="padding: 32px 24px; background: #f8f9fa;">
            <h2 style="color: #1a2744;">Documents Needed</h2>
            <p>Dear ${borrowerName},</p>
            <p>To continue processing your funding request, we need the following:</p>
            <ul style="background: #ffffff; padding: 16px 32px; border-radius: 4px; border-left: 4px solid #f4a261;">
              ${itemsList}
            </ul>
            <p>Please upload these documents through your application portal as soon as possible.</p>
            <p style="margin-top: 24px;">— The TruCredit Capital Underwriting Team</p>

            <div style="margin-top: 24px; text-align: center;">
  </div>
          </div>
          <div style="background: #e9ecef; padding: 16px; text-align: center; font-size: 12px; color: #6c757d;">
            <p>TruCredit Capital is a commercial lender. All loans are for business purposes only. Equal Opportunity Lender.</p>
          </div>
        </div>
      `,
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map