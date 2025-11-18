import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class PromptService implements OnModuleInit {
  private readonly logger = new Logger(PromptService.name);
  private readonly promptsDir = this.getPromptsDir();
  private readonly templates = new Map<string, Handlebars.TemplateDelegate>();

  private getPromptsDir(): string {
    // Try multiple possible locations
    const possiblePaths = [
      // Development mode (source)
      path.join(process.cwd(), 'src/modules/ai/prompts'),
      // Production mode (compiled)
      path.join(__dirname, '../prompts'),
      // Alternative production path
      path.join(process.cwd(), 'dist/src/modules/ai/prompts'),
      // Fallback
      path.join(__dirname, '../../../../src/modules/ai/prompts'),
    ];

    // Return first path that exists (we'll check in loadTemplates)
    return possiblePaths[0]; // Default to development path
  }

  async onModuleInit() {
    await this.loadTemplates();
  }

  private async loadTemplates() {
    // Try multiple possible paths
    const possiblePaths = [
      path.join(process.cwd(), 'src/modules/ai/prompts'),
      path.join(__dirname, '../prompts'),
      path.join(process.cwd(), 'dist/src/modules/ai/prompts'),
      path.join(__dirname, '../../../../src/modules/ai/prompts'),
    ];

    let promptsDir: string | null = null;
    
    // Find the first path that exists
    for (const dirPath of possiblePaths) {
      try {
        await fs.access(dirPath);
        promptsDir = dirPath;
        this.logger.log(`Found prompts directory: ${dirPath}`);
        break;
      } catch {
        // Path doesn't exist, try next
        continue;
      }
    }

    if (!promptsDir) {
      this.logger.error('Could not find prompts directory. Tried:', possiblePaths);
      throw new Error('Prompts directory not found');
    }

    try {
      const files = await fs.readdir(promptsDir);
      
      for (const file of files) {
        if (path.extname(file) === '.txt') {
          const templateName = path.basename(file, '.txt');
          const templateContent = await fs.readFile(
            path.join(promptsDir, file),
            'utf-8',
          );
          this.templates.set(templateName, Handlebars.compile(templateContent));
          this.logger.log(`Loaded prompt template: ${templateName}`);
        }
      }
      
      if (this.templates.size === 0) {
        this.logger.warn('No prompt templates found in:', promptsDir);
      }
    } catch (error) {
      this.logger.error('Failed to load prompt templates:', error);
      throw error;
    }
  }

  renderPrompt(templateName: string, variables: Record<string, any>): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Prompt template '${templateName}' not found`);
    }
    return template(variables);
  }

  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys());
  }
}

