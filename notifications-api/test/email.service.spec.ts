import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../src/email/email.service';
import { TemplateService } from '../src/email/template.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let templateService: TemplateService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config = {
        'SMTP_HOST': 'smtp.test.com',
        'SMTP_PORT': 587,
        'SMTP_SECURE': false,
        'SMTP_USER': 'testuser',
        'SMTP_PASSWORD': 'testpass',
        'SMTP_DEFAULT_FROM': 'test@example.com',
      };
      return key in config ? config[key] : defaultValue;
    }),
  };

  const mockTemplateService = {
    compileTemplate: jest.fn(),
  };

  const mockTransporter = {
    sendMail: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TemplateService, useValue: mockTemplateService },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    templateService = module.get<TemplateService>(TemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyConnection', () => {
    it('should return true when SMTP connection is verified', async () => {
      mockTransporter.verify.mockResolvedValue(true);
      
      expect(await service.verifyConnection()).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should return false when SMTP connection fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));
      
      expect(await service.verifyConnection()).toBe(false);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const messageId = 'test-message-id';
      mockTransporter.sendMail.mockResolvedValue({ messageId });
      
      const emailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      const result = await service.sendEmail(emailDto);
      
      expect(result).toHaveProperty('messageId', messageId);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: emailDto.to,
        subject: emailDto.subject,
        text: emailDto.text,
      }));
    });

    it('should throw an error when sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('Sending failed'));
      
      const emailDto = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test content',
      };

      await expect(service.sendEmail(emailDto)).rejects.toThrow('Failed to send email');
    });

    it('should handle multiple recipients', async () => {
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
      
      const emailDto = {
        to: ['recipient1@example.com', 'recipient2@example.com'],
        subject: 'Test Subject',
        text: 'Test content',
      };

      await service.sendEmail(emailDto);
      
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'recipient1@example.com,recipient2@example.com',
      }));
    });
  });

  describe('sendTemplateEmail', () => {
    it('should send a template email successfully', async () => {
      const compiledTemplate = {
        name: 'welcome',
        subject: 'Welcome John',
        htmlContent: '<p>Hello John</p>',
        textContent: 'Hello John',
      };
      
      mockTemplateService.compileTemplate.mockResolvedValue(compiledTemplate);
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
      
      await service.sendTemplateEmail(
        'welcome',
        'recipient@example.com',
        { name: 'John' }
      );
      
      expect(mockTemplateService.compileTemplate).toHaveBeenCalledWith('welcome', { name: 'John' });
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expect.objectContaining({
        subject: compiledTemplate.subject,
        html: compiledTemplate.htmlContent,
        text: compiledTemplate.textContent,
      }));
    });

    it('should throw an error when template is not found', async () => {
      mockTemplateService.compileTemplate.mockResolvedValue(null);
      
      await expect(service.sendTemplateEmail(
        'non-existent', 
        'recipient@example.com', 
        {}
      )).rejects.toThrow('Template "non-existent" not found');
    });
  });
});
