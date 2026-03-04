import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { Order } from 'src/orders/order.entity';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private readonly FROM_EMAIL: string;

  constructor(private configService: ConfigService) {
    this.FROM_EMAIL = this.configService.get('MAIL_FROM') || 'noreply@lawhacanvas.com';
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    const sendGridApiKey = this.configService.get('SENDGRID_API_KEY');
    const nodeEnv = this.configService.get('NODE_ENV');

    if (nodeEnv === 'development') {
      if (!sendGridApiKey) {
        this.logger.warn(
          'SENDGRID_API_KEY not set in development. Email sending will be mocked.',
        );
      } else {
        sgMail.setApiKey(sendGridApiKey);
        this.logger.log('SendGrid initialized with API key');
      }
    } else {
      // Production: SendGrid API key is required
      if (!sendGridApiKey) {
        throw new Error('SENDGRID_API_KEY is required in production environment');
      }
      sgMail.setApiKey(sendGridApiKey);
      this.logger.log('SendGrid initialized for production');
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const msg = {
        to: options.to,
        from: this.FROM_EMAIL,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
      };

      const sendGridApiKey = this.configService.get('SENDGRID_API_KEY');

      // In development without API key, just log
      if (!sendGridApiKey) {
        this.logger.log(`[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`);
        return;
      }

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
        error.stack,
      );
      // Don't throw - email failures shouldn't block order processing
    }
  }

  async sendOrderConfirmation(order: Order, userEmail: string): Promise<void> {
    const html = this.getOrderConfirmationTemplate(order);
    await this.sendEmail({
      to: userEmail,
      subject: `Order Confirmed - #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text: `Your order #${order.id.substring(0, 8).toUpperCase()} has been confirmed for $${order.total.toFixed(2)}`,
    });
  }

  async sendPaymentSuccessful(order: Order, userEmail: string): Promise<void> {
    const html = this.getPaymentSuccessTemplate(order);
    await this.sendEmail({
      to: userEmail,
      subject: `Payment Received - Order #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text: `Payment of $${order.total.toFixed(2)} has been successfully received for your order.`,
    });
  }

  async sendPaymentFailed(order: Order, userEmail: string, reason?: string): Promise<void> {
    const html = this.getPaymentFailedTemplate(order, reason);
    await this.sendEmail({
      to: userEmail,
      subject: `Payment Failed - Order #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text: `Unfortunately, payment failed for your order. Please try again or contact support.`,
    });
  }

  async sendOrderShipped(order: Order, userEmail: string, trackingNumber?: string): Promise<void> {
    const html = this.getOrderShippedTemplate(order, trackingNumber);
    await this.sendEmail({
      to: userEmail,
      subject: `Your Order Has Shipped - #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text: `Your canvas has been shipped! ${trackingNumber ? `Tracking: ${trackingNumber}` : ''}`,
    });
  }

  async sendOrderRefunded(order: Order, userEmail: string, amount: number): Promise<void> {
    const html = this.getOrderRefundedTemplate(order, amount);
    await this.sendEmail({
      to: userEmail,
      subject: `Refund Processed - Order #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text: `A refund of $${amount.toFixed(2)} has been processed to your original payment method.`,
    });
  }

  private getOrderConfirmationTemplate(order: Order): string {
    const orderTotal = order.total.toFixed(2);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #667eea; }
            .section h2 { margin-top: 0; font-size: 16px; color: #667eea; }
            .order-id { font-size: 14px; color: #666; margin: 10px 0; }
            .amount { font-size: 28px; font-weight: bold; color: #667eea; margin: 10px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmed! 🎉</h1>
            </div>
            
            <div class="section">
              <h2>Thank You for Your Order</h2>
              <p>Your custom canvas order has been confirmed and is being prepared for production.</p>
              <div class="order-id">Order ID: <strong>#${order.id.substring(0, 8).toUpperCase()}</strong></div>
              <div class="amount">$${orderTotal}</div>
            </div>

            <div class="section">
              <h2>Next Steps</h2>
              <p>We will process your payment and begin production on your canvas. Once your order ships, you'll receive a tracking number.</p>
            </div>

            <div class="section">
              <h2>Questions?</h2>
              <p>If you have any questions about your order, please reply to this email or contact our support team at support@lawhacanvas.com</p>
            </div>

            <div class="footer">
              <p>© 2026 Lawha Canvas. All rights reserved.</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPaymentSuccessTemplate(order: Order): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #11998e; }
            .section h2 { margin-top: 0; font-size: 16px; color: #11998e; }
            .amount { font-size: 28px; font-weight: bold; color: #11998e; margin: 10px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received ✓</h1>
            </div>
            
            <div class="section">
              <h2>Payment Confirmed</h2>
              <p>Your payment has been successfully processed. Your canvas is now in production!</p>
              <div class="amount">$${order.total.toFixed(2)}</div>
            </div>

            <div class="section">
              <h2>Production Timeline</h2>
              <ul>
                <li><strong>Current Status:</strong> Production</li>
                <li><strong>Estimated Completion:</strong> 5-7 business days</li>
                <li><strong>Shipping:</strong> Standard (3-5 business days)</li>
              </ul>
            </div>

            <div class="footer">
              <p>© 2026 Lawha Canvas. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getPaymentFailedTemplate(order: Order, reason?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .section { margin: 20px 0; padding: 15px; background: #fdf2f8; border-left: 4px solid #f5576c; }
            .section h2 { margin-top: 0; font-size: 16px; color: #f5576c; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed ⚠️</h1>
            </div>
            
            <div class="section">
              <h2>We Couldn't Process Your Payment</h2>
              <p>${reason || 'Your payment could not be processed. This could be due to insufficient funds, expired card, or other issues.'}</p>
              <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
            </div>

            <div class="section">
              <h2>What To Do Next</h2>
              <ol>
                <li>Check your card details (number, expiration, CVC)</li>
                <li>Ensure you have sufficient funds</li>
                <li>Try a different payment method if available</li>
                <li>Contact your bank if the issue persists</li>
              </ol>
            </div>

            <div class="section">
              <h2>Need Help?</h2>
              <p>Please contact our support team at support@lawhacanvas.com or reply to this email for assistance.</p>
            </div>

            <div class="footer">
              <p>© 2026 Lawha Canvas. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderShippedTemplate(order: Order, trackingNumber?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .section { margin: 20px 0; padding: 15px; background: #f0f7ff; border-left: 4px solid #667eea; }
            .tracking { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 10px 0; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Order Has Shipped! 📦</h1>
            </div>
            
            <div class="section">
              <h2>On Its Way to You</h2>
              <p>Your beautiful custom canvas is now on the way! Your order is being handled by our shipping partner.</p>
              ${trackingNumber ? `<div class="tracking">Tracking Number: <strong>${trackingNumber}</strong></div>` : ''}
            </div>

            <div class="section">
              <h2>Delivery Estimate</h2>
              <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
              <p>Track your package in real-time using the tracking number above.</p>
            </div>

            <div class="footer">
              <p>© 2026 Lawha Canvas. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getOrderRefundedTemplate(order: Order, amount: number): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .section { margin: 20px 0; padding: 15px; background: #f0fdf4; border-left: 4px solid #11998e; }
            .amount { font-size: 24px; font-weight: bold; color: #11998e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Refund Processed ✓</h1>
            </div>
            
            <div class="section">
              <h2>Your Refund Has Been Issued</h2>
              <p>A refund has been successfully processed to your original payment method.</p>
              <div class="amount">$${amount.toFixed(2)}</div>
              <p><strong>Processing Time:</strong> 3-5 business days (depending on your bank)</p>
            </div>

            <div class="section">
              <h2>Questions?</h2>
              <p>If you don't see the refund within 5 business days, please contact your bank or reach out to us at support@lawhacanvas.com</p>
            </div>

            <div class="footer">
              <p>© 2026 Lawha Canvas. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
