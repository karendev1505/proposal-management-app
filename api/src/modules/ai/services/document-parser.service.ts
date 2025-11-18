import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as mammoth from 'mammoth';
import { AIService } from './ai.service';
import { PromptService } from './prompt.service';

@Injectable()
export class DocumentParserService {
  private readonly logger = new Logger(DocumentParserService.name);
  private pdfParseModule: any = null;

  constructor(
    private aiService: AIService,
    private promptService: PromptService,
  ) {}

  private async getPdfParse() {
    if (this.pdfParseModule === null) {
      // Lazy load pdf-parse only when needed to avoid DOMMatrix issues at startup
      try {
        // Use dynamic import to load only when needed
        const pdfParseModule = await import('pdf-parse');
        this.pdfParseModule = pdfParseModule.default || pdfParseModule;
      } catch (error: any) {
        this.logger.warn('PDF parsing not available:', error?.message || error);
        this.pdfParseModule = false; // Mark as unavailable
      }
    }
    if (this.pdfParseModule === false) {
      throw new BadRequestException(
        'PDF parsing is not available. Please ensure all dependencies are installed correctly.',
      );
    }
    return this.pdfParseModule;
  }

  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = await this.getPdfParse();
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('PDF parsing error:', error);
      throw new BadRequestException(
        `Failed to parse PDF file: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  async extractTextFromDOCX(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      this.logger.error('DOCX parsing error:', error);
      throw new BadRequestException('Failed to parse DOCX file');
    }
  }

  async extractTextFromTXT(buffer: Buffer): Promise<string> {
    return buffer.toString('utf-8');
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;
    const buffer = file.buffer;

    if (mimeType === 'application/pdf') {
      try {
        return await this.extractTextFromPDF(buffer);
      } catch (error) {
        // If PDF parsing fails, log but don't crash the app
        this.logger.warn('PDF parsing failed, trying alternative method:', error);
        throw error;
      }
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.extractTextFromDOCX(buffer);
    } else if (mimeType === 'text/plain') {
      return this.extractTextFromTXT(buffer);
    } else {
      throw new BadRequestException(
        `Unsupported file type: ${mimeType}. Supported: PDF, DOCX, TXT`,
      );
    }
  }

  async extractDataFromDocument(
    userId: string,
    workspaceId: string | null,
    file: Express.Multer.File,
  ) {
    const text = await this.extractText(file);

    // Use AI to extract structured data
    const prompt = this.promptService.renderPrompt('extractData', {
      documentText: text,
    });

    // This would call AI service, but for now return basic extraction
    return {
      text,
      extracted: {
        clientName: this.extractClientName(text),
        projectSummary: this.extractProjectSummary(text),
        estimatedBudget: this.extractBudget(text),
        goals: this.extractGoals(text),
        timeline: this.extractTimeline(text),
        keyRequirements: this.extractRequirements(text),
      },
    };
  }

  async convertDocumentToProposal(
    userId: string,
    workspaceId: string | null,
    file: Express.Multer.File,
    tone: string = 'formal',
  ) {
    const text = await this.extractText(file);
    const extracted = await this.extractDataFromDocument(userId, workspaceId, file);

    // Generate proposal from extracted data
    return this.aiService.generateProposal(
      userId,
      workspaceId,
      {
        projectDescription: extracted.extracted.projectSummary || text.substring(0, 1000),
        clientInfo: extracted.extracted.clientName || 'Client',
        tone: tone as any,
        sections: ['overview', 'pricing', 'timeline'],
      },
    );
  }

  private extractClientName(text: string): string | null {
    const patterns = [
      /client[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /for[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /company[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  private extractProjectSummary(text: string): string | null {
    const lines = text.split('\n').slice(0, 5);
    return lines.join(' ').substring(0, 500) || null;
  }

  private extractBudget(text: string): string | null {
    const patterns = [
      /\$[\d,]+/,
      /budget[:\s]+[\$]?[\d,]+/i,
      /price[:\s]+[\$]?[\d,]+/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }

    return null;
  }

  private extractGoals(text: string): string[] {
    const goals: string[] = [];
    const goalPattern = /goal[s]?[:\s]+(.+?)(?:\n|$)/gi;
    let match;

    while ((match = goalPattern.exec(text)) !== null && goals.length < 5) {
      goals.push(match[1].trim());
    }

    return goals;
  }

  private extractTimeline(text: string): string | null {
    const patterns = [
      /timeline[:\s]+(.+?)(?:\n|$)/i,
      /deadline[:\s]+(.+?)(?:\n|$)/i,
      /duration[:\s]+(.+?)(?:\n|$)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return null;
  }

  private extractRequirements(text: string): string[] {
    const requirements: string[] = [];
    const reqPattern = /requirement[s]?[:\s]+(.+?)(?:\n|$)/gi;
    let match;

    while ((match = reqPattern.exec(text)) !== null && requirements.length < 10) {
      requirements.push(match[1].trim());
    }

    return requirements;
  }
}

