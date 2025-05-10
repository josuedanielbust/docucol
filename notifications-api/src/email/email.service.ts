import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {}

  /**
   * Initialize the email service and verify connection on module init
   */
  async onModuleInit() {
    this.initializeTransporter();
    await this.verifyConnection();
  }

  /**
   * Initialize the nodemailer transporter with SMTP configuration
   */
  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('smtp.host'),
      port: this.configService.get<number>('smtp.port', 587),
      auth: {
        user: this.configService.get<string>('smtp.auth.username'),
        pass: this.configService.get<string>('smtp.auth.password'),
      },
    });

    this.logger.log('Email service transporter initialized');
  }

  /**
   * Verify SMTP connection
   * @returns Promise<boolean> Connection status
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      this.logger.error(`SMTP connection verification failed: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Send an email using direct content
   * @param emailDto Email data transfer object
   * @returns Promise with send info
   */
  async sendEmail(emailDto: SendEmailDto): Promise<any> {
    try {
      const { to, cc, bcc, subject, text, html, from, attachments } = emailDto;
      
      const result = await this.transporter.sendMail({
        from: from || this.configService.get<string>('smtp.options.defaultFrom'),
        to: Array.isArray(to) ? to.join(',') : to,
        cc: cc ? (Array.isArray(cc) ? cc.join(',') : cc) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc.join(',') : bcc) : undefined,
        subject,
        text,
        html,
        attachments,
      });
      
      this.logger.log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email: ${(error as Error).message}`);
      throw new Error(`Failed to send email: ${(error as Error).message}`);
    }
  }

  /**
   * Send an email using a template
   * @param templateName Name of the template to use
   * @param to Recipient(s)
   * @param context Template context data
   * @param options Additional email options
   * @returns Promise with send info
   */
  async sendTemplateEmail(
    templateName: string,
    to: string | string[],
    context: Record<string, any>,
    options?: {
      from?: string;
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: Buffer | string;
        contentType?: string;
      }>;
    },
  ): Promise<any> {
    const template = await this.templateService.compileTemplate(templateName, context);
    
    if (!template) {
      throw new Error(`Template "${templateName}" not found`);
    }

    return this.sendEmail({
      to,
      subject: template.subject,
      html: template.htmlContent,
      text: template.textContent,
      ...options,
    });
  }
}
