import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();
  private readonly templatesDir = path.join(__dirname, '../templates');

  async loadTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      
      for (const file of files) {
        if (path.extname(file) === '.hbs') {
          const templateName = path.basename(file, '.hbs');
          const templateContent = await fs.readFile(
            path.join(this.templatesDir, file),
            'utf-8',
          );
          this.templates.set(templateName, Handlebars.compile(templateContent));
        }
      }
      
      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.error('Failed to load email templates:', error.stack);
      throw error;
    }
  }

  renderTemplate(templateName: string, context: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    return template(context);
  }

  getTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }
}
