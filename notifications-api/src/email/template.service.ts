import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export interface EmailTemplate {
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Map<string, EmailTemplate> = new Map();
  private templateDir: string;
  private appName: string;

  constructor(private readonly configService: ConfigService) {
    this.templateDir = this.configService.get<string>(
      'email.templatedir',
      path.join(process.cwd(), 'src', 'templates', 'emails')
    );
    this.appName = this.configService.get<string>('app.name', 'DocuCol');
    this.loadTemplates();
  }

  /**
   * Load email templates from the filesystem
   */
  private loadTemplates(): void {
    try {
      if (!fs.existsSync(this.templateDir)) {
        fs.mkdirSync(this.templateDir, { recursive: true });
        this.logger.log(`Created template directory: ${this.templateDir}`);
        
        // Create example template
        this.createExampleTemplate();
        return;
      }

      const templateDirs = fs.readdirSync(this.templateDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const templateName of templateDirs) {
        const templatePath = path.join(this.templateDir, templateName);
        const subjectPath = path.join(templatePath, 'subject.txt');
        const htmlPath = path.join(templatePath, 'html.hbs');
        const textPath = path.join(templatePath, 'text.hbs');

        if (fs.existsSync(subjectPath) && 
            (fs.existsSync(htmlPath) || fs.existsSync(textPath))) {
          
          const subject = fs.readFileSync(subjectPath, 'utf-8').trim();
          let htmlContent = '';
          let textContent = '';
          
          if (fs.existsSync(htmlPath)) {
            htmlContent = fs.readFileSync(htmlPath, 'utf-8');
          }
          
          if (fs.existsSync(textPath)) {
            textContent = fs.readFileSync(textPath, 'utf-8');
          }

          this.templates.set(templateName, {
            name: templateName,
            subject,
            htmlContent,
            textContent,
          });
          
          this.logger.log(`Loaded template: ${templateName}`);
        }
      }
      
      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error(`Failed to load email templates: ${(error as Error).message}`);
    }
  }

  /**
   * Create example template if no templates exist
   */
  private createExampleTemplate(): void {
    try {
      const welcomeDir = path.join(this.templateDir, 'welcome');
      fs.mkdirSync(welcomeDir, { recursive: true });
      
      fs.writeFileSync(
        path.join(welcomeDir, 'subject.txt'), 
        'Welcome to {{appName}}!'
      );
      
      fs.writeFileSync(
        path.join(welcomeDir, 'html.hbs'), 
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to {{appName}}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A86E8; color: white; padding: 10px; text-align: center; }
    .footer { font-size: 12px; color: #666; margin-top: 30px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{appName}}!</h1>
    </div>
    
    <p>Hello {{name}},</p>
    
    <p>Thank you for joining {{appName}}. We're excited to have you as part of our community!</p>
    
    <p>To get started, please click the link below to verify your email address:</p>
    
    <p><a href="{{verificationLink}}">Verify your email address</a></p>
    
    <p>If you have any questions, please don't hesitate to contact our support team.</p>
    
    <p>Best regards,<br>The {{appName}} Team</p>
    
    <div class="footer">
      This is an automated message, please do not reply directly to this email.
    </div>
  </div>
</body>
</html>`
      );
      
      fs.writeFileSync(
        path.join(welcomeDir, 'text.hbs'), 
        `Welcome to {{appName}}!

Hello {{name}},

Thank you for joining {{appName}}. We're excited to have you as part of our community!

To get started, please visit the link below to verify your email address:

{{verificationLink}}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
The {{appName}} Team

This is an automated message, please do not reply directly to this email.`
      );
      
      this.templates.set('welcome', {
        name: 'welcome',
        subject: 'Welcome to {{appName}}!',
        htmlContent: fs.readFileSync(path.join(welcomeDir, 'html.hbs'), 'utf-8'),
        textContent: fs.readFileSync(path.join(welcomeDir, 'text.hbs'), 'utf-8'),
      });
      
      this.logger.log('Created example welcome template');
    } catch (error) {
      this.logger.error(`Failed to create example template: ${(error as Error).message}`);
    }
  }

  /**
   * Get template by name without compilation
   * @param name Template name
   * @returns Email template object or null if not found
   */
  getTemplate(name: string): EmailTemplate | null {
    return this.templates.get(name) || null;
  }

  /**
   * Compile a template with provided context
   * @param name Template name
   * @param context Template variables
   * @returns Compiled template with interpolated variables
   */
  async compileTemplate(
    name: string,
    context: Record<string, any>
  ): Promise<EmailTemplate | null> {
    const template = this.templates.get(name);
    
    if (!template) {
      this.logger.warn(`Template "${name}" not found`);
      return null;
    }

    try {
      // Compile subject
      const subjectTemplate = Handlebars.compile(template.subject);
      const compiledSubject = subjectTemplate({ appName: this.appName, ...context });
      
      // Compile HTML content if it exists
      let compiledHtml = '';
      if (template.htmlContent) {
        const htmlTemplate = Handlebars.compile(template.htmlContent);
        compiledHtml = htmlTemplate({ appName: this.appName, ...context });
      }
      
      // Compile text content if it exists
      let compiledText = '';
      if (template.textContent) {
        const textTemplate = Handlebars.compile(template.textContent);
        compiledText = textTemplate({ appName: this.appName, ...context });
      }
      
      return {
        ...template,
        subject: compiledSubject,
        htmlContent: compiledHtml,
        textContent: compiledText,
      };
    } catch (error) {
      this.logger.error(`Failed to compile template "${name}": ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Add or update a template
   * @param template Template object to add
   * @returns Boolean indicating success
   */
  async saveTemplate(template: EmailTemplate): Promise<boolean> {
    try {
      const templateDir = path.join(this.templateDir, template.name);
      
      // Create template directory if it doesn't exist
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }
      
      // Write subject file
      fs.writeFileSync(path.join(templateDir, 'subject.txt'), template.subject);
      
      // Write HTML template if provided
      if (template.htmlContent) {
        fs.writeFileSync(path.join(templateDir, 'html.hbs'), template.htmlContent);
      }
      
      // Write text template if provided
      if (template.textContent) {
        fs.writeFileSync(path.join(templateDir, 'text.hbs'), template.textContent);
      }
      
      // Update in-memory template
      this.templates.set(template.name, template);
      
      this.logger.log(`Template "${template.name}" saved successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to save template "${template.name}": ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Delete a template
   * @param name Template name
   * @returns Boolean indicating success
   */
  async deleteTemplate(name: string): Promise<boolean> {
    if (!this.templates.has(name)) {
      this.logger.warn(`Template "${name}" not found for deletion`);
      return false;
    }

    try {
      const templateDir = path.join(this.templateDir, name);
      
      if (fs.existsSync(templateDir)) {
        // Remove all files in the directory
        const files = fs.readdirSync(templateDir);
        for (const file of files) {
          fs.unlinkSync(path.join(templateDir, file));
        }
        
        // Remove the directory
        fs.rmdirSync(templateDir);
      }
      
      // Remove from in-memory map
      this.templates.delete(name);
      
      this.logger.log(`Template "${name}" deleted successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete template "${name}": ${(error as Error).message}`);
      return false;
    }
  }
}
