import { 
  Controller, 
  Post, 
  Body, 
  HttpStatus, 
  HttpException,
  Get,
  Param,
  Delete
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';
import { SendEmailDto } from './dto/send-email.dto';
import { TemplateEmailDto } from './dto/template-email.dto';

@ApiTags('email')
@Controller('email')
@ApiBearerAuth()
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email' })
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Email sent successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid request data' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Email sending failed' 
  })
  async sendEmail(@Body() emailDto: SendEmailDto) {
    try {
      const result = await this.emailService.sendEmail(emailDto);
      return {
        success: true,
        messageId: result?.messageId,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send email: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-template')
  @ApiOperation({ summary: 'Send an email using a template' })
  @ApiBody({ type: TemplateEmailDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Template email sent successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid template or request data' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Template email sending failed' 
  })
  async sendTemplateEmail(@Body() templateEmailDto: TemplateEmailDto) {
    try {
      const { 
        templateName, 
        to, 
        context, 
        from, 
        cc, 
        bcc, 
        attachments 
      } = templateEmailDto;

      const result = await this.emailService.sendTemplateEmail(
        templateName,
        to,
        context,
        { from, cc, bcc, attachments },
      );

      return {
        success: true,
        messageId: result?.messageId,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to send template email: ${(error as Error).message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('templates')
  @ApiOperation({ summary: 'List all available templates' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of available templates' 
  })
  async listTemplates() {
    const templates = Array.from(this.templateService['templates'].values())
      .map(t => ({
        name: t.name,
        subject: t.subject,
        hasHtml: !!t.htmlContent,
        hasText: !!t.textContent,
      }));

    return {
      success: true,
      templates,
    };
  }

  @Get('templates/:name')
  @ApiOperation({ summary: 'Get template details' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Template details' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Template not found' 
  })
  async getTemplate(@Param('name') name: string) {
    const template = this.templateService.getTemplate(name);
    
    if (!template) {
      throw new HttpException(
        `Template "${name}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      template,
    };
  }

  @Delete('templates/:name')
  @ApiOperation({ summary: 'Delete a template' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Template deleted successfully' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Template not found' 
  })
  @ApiResponse({ 
    status: HttpStatus.INTERNAL_SERVER_ERROR, 
    description: 'Failed to delete template' 
  })
  async deleteTemplate(@Param('name') name: string) {
    const success = await this.templateService.deleteTemplate(name);
    
    if (!success) {
      throw new HttpException(
        `Failed to delete template "${name}"`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
      message: `Template "${name}" deleted successfully`,
    };
  }
}
