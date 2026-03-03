import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import * as sgMail from '@sendgrid/mail';

// Mock SendGrid
jest.mock('@sendgrid/mail');

// Mock Order
const mockOrder: any = {
  id: 'order-123',
  user_id: 'user-456',
  status: 'pending',
  total_amount: 99.99,
  shipping_address: '123 Main St',
  tracking_number: null,
  print_pdf_url: null,
  shipped_at: null,
  delivered_at: null,
  created_at: new Date(),
  updated_at: new Date(),
  user: null,
  items: [],
};

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let mockConfigGet: jest.Mock;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock ConfigService
    mockConfigGet = jest.fn((key: string) => {
      const config: { [key: string]: any } = {
        NODE_ENV: 'development',
        SENDGRID_API_KEY: '',
        MAIL_FROM: 'noreply@lawhacanvas.com',
      };
      return config[key];
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: { get: mockConfigGet },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('sendEmail', () => {
    it('should send email via SendGrid when API key is set', async () => {
      // Setup: API key is set
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'production',
          SENDGRID_API_KEY: 'SG_test_key_123',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      // Reinitialize service with API key
      service = new EmailService(configService);

      // Mock sgMail.send
      (sgMail.send as jest.Mock).mockResolvedValue({});

      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await service.sendEmail(emailOptions);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        from: 'noreply@lawhacanvas.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
        text: 'Test content',
      });
    });

    it('should mock email when API key is not set in development', async () => {
      // Setup: No API key in development
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'development',
          SENDGRID_API_KEY: '',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      service = new EmailService(configService);

      // Mock logger
      const loggerSpy = jest.spyOn(service['logger'], 'log');

      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test Email',
        html: '<p>Test content</p>',
      };

      await service.sendEmail(emailOptions);

      // Should log mock email instead of sending
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MOCK EMAIL]'),
      );

      // Should NOT call SendGrid
      expect(sgMail.send).not.toHaveBeenCalled();
    });

    it('should auto-generate plain text from HTML if not provided', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'production',
          SENDGRID_API_KEY: 'SG_test_key_123',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      service = new EmailService(configService);
      (sgMail.send as jest.Mock).mockResolvedValue({});

      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test',
        html: '<h1>Hello</h1><p>World</p>',
      };

      await service.sendEmail(emailOptions);

      // Should have generated plain text
      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          text: 'HelloWorld',
        }),
      );
    });

    it('should handle SendGrid API errors gracefully', async () => {
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'production',
          SENDGRID_API_KEY: 'SG_test_key_123',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      service = new EmailService(configService);
      const error = new Error('SendGrid API Error');
      (sgMail.send as jest.Mock).mockRejectedValue(error);

      const loggerSpy = jest.spyOn(service['logger'], 'error');

      const emailOptions = {
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
      };

      // Should not throw, just log error
      await expect(service.sendEmail(emailOptions)).resolves.not.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send email'),
        expect.any(String),
      );
    });
  });

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendOrderConfirmation(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Order Confirmed'),
          html: expect.stringContaining('Order Confirmed'),
        }),
      );
    });

    it('should include order ID in confirmation email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendOrderConfirmation(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(mockOrder.id.substring(0, 8).toUpperCase()),
        }),
      );
    });
  });

  describe('sendPaymentSuccessful', () => {
    it('should send payment success email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendPaymentSuccessful(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Payment Received'),
        }),
      );
    });

    it('should include order amount in payment email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendPaymentSuccessful(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('99.99'),
        }),
      );
    });
  });

  describe('sendPaymentFailed', () => {
    it('should send payment failed email without reason', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendPaymentFailed(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Payment Failed'),
        }),
      );
    });

    it('should include custom reason in payment failed email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');
      const reason = 'Insufficient funds';

      await service.sendPaymentFailed(mockOrder, 'customer@example.com', reason);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(reason),
        }),
      );
    });
  });

  describe('sendOrderShipped', () => {
    it('should send order shipped email without tracking number', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendOrderShipped(mockOrder, 'customer@example.com');

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Shipped'),
        }),
      );
    });

    it('should include tracking number when provided', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');
      const trackingNumber = 'TRACK123456789';

      await service.sendOrderShipped(mockOrder, 'customer@example.com', trackingNumber);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(trackingNumber),
        }),
      );
    });
  });

  describe('sendOrderRefunded', () => {
    it('should send order refunded email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');
      const refundAmount = 50.00;

      await service.sendOrderRefunded(mockOrder, 'customer@example.com', refundAmount);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          subject: expect.stringContaining('Refund Processed'),
        }),
      );
    });

    it('should include refund amount in email', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');
      const refundAmount = 50.00;

      await service.sendOrderRefunded(mockOrder, 'customer@example.com', refundAmount);

      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('50.00'),
        }),
      );
    });
  });

  describe('Initialization', () => {
    it('should warn when API key is not set in development', () => {
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'development',
          SENDGRID_API_KEY: '',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');

      service = new EmailService(configService);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SENDGRID_API_KEY not set'),
      );
    });

    it('should throw error when API key is missing in production', () => {
      mockConfigGet.mockImplementation((key: string) => {
        const config: { [key: string]: any } = {
          NODE_ENV: 'production',
          SENDGRID_API_KEY: '',
          MAIL_FROM: 'noreply@lawhacanvas.com',
        };
        return config[key];
      });

      expect(() => {
        service = new EmailService(configService);
      }).toThrow('SENDGRID_API_KEY is required in production environment');
    });
  });
});
