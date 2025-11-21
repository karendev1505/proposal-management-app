import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { PromptService } from './prompt.service';

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProposalGenerationInput {
  projectDescription: string;
  clientInfo?: string;
  tone?: 'formal' | 'friendly' | 'salesy';
  sections?: string[];
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private openai: OpenAI;
  private readonly defaultModel = 'gpt-4o-mini';
  private readonly modelPricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
  };

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private promptService: PromptService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not set. AI features will be disabled.');
    } else {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateProposal(
    userId: string,
    workspaceId: string | null,
    input: ProposalGenerationInput,
    options?: AIGenerateOptions,
  ) {
    if (!this.openai) {
      throw new BadRequestException('AI service is not configured');
    }

    const model = options?.model || this.defaultModel;
    const tone = input.tone || 'formal';
    const sections = input.sections || ['overview', 'pricing', 'timeline'];

    const prompt = this.promptService.renderPrompt('generateProposal', {
      projectDescription: input.projectDescription,
      clientInfo: input.clientInfo || 'Not provided',
      tone,
      sections: sections.join(', '),
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert business proposal writer. Generate professional, compelling proposals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('AI did not generate content');
      }

      const usage = completion.usage;
      const cost = this.calculateCost(
        model,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
      );

      // Log usage
      await this.logUsage(userId, workspaceId, {
        tokens: usage?.total_tokens || 0,
        cost,
        model,
        action: 'generate_proposal',
        metadata: {
          tone,
          sections,
          promptTokens: usage?.prompt_tokens,
          completionTokens: usage?.completion_tokens,
        },
      });

      return {
        content,
        sections: this.parseProposalSections(content),
        usage: {
          tokens: usage?.total_tokens || 0,
          cost,
          model,
        },
      };
    } catch (error) {
      this.logger.error('AI generation error:', error);
      throw new BadRequestException(`AI generation failed: ${error.message}`);
    }
  }

  async improveSection(
    userId: string,
    workspaceId: string | null,
    section: string,
    tone: string = 'professional',
    options?: AIGenerateOptions,
  ) {
    if (!this.openai) {
      throw new BadRequestException('AI service is not configured');
    }

    const model = options?.model || this.defaultModel;
    const prompt = this.promptService.renderPrompt('improveSection', {
      section,
      tone,
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business writing editor.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('AI did not generate content');
      }

      const usage = completion.usage;
      const cost = this.calculateCost(
        model,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
      );

      await this.logUsage(userId, workspaceId, {
        tokens: usage?.total_tokens || 0,
        cost,
        model,
        action: 'improve_section',
      });

      return {
        improved: content,
        original: section,
        usage: {
          tokens: usage?.total_tokens || 0,
          cost,
          model,
        },
      };
    } catch (error) {
      this.logger.error('AI improvement error:', error);
      throw new BadRequestException(`AI improvement failed: ${error.message}`);
    }
  }

  async rewriteTone(
    userId: string,
    workspaceId: string | null,
    text: string,
    targetTone: string,
    options?: AIGenerateOptions,
  ) {
    if (!this.openai) {
      throw new BadRequestException('AI service is not configured');
    }

    const model = options?.model || this.defaultModel;
    const prompt = this.promptService.renderPrompt('rewriteTone', {
      text,
      tone: targetTone,
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business writer specializing in tone adaptation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1000,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('AI did not generate content');
      }

      const usage = completion.usage;
      const cost = this.calculateCost(
        model,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
      );

      await this.logUsage(userId, workspaceId, {
        tokens: usage?.total_tokens || 0,
        cost,
        model,
        action: 'rewrite_tone',
      });

      return {
        rewritten: content,
        original: text,
        tone: targetTone,
        usage: {
          tokens: usage?.total_tokens || 0,
          cost,
          model,
        },
      };
    } catch (error) {
      this.logger.error('AI rewrite error:', error);
      throw new BadRequestException(`AI rewrite failed: ${error.message}`);
    }
  }

  async getPricingRecommendations(
    userId: string,
    workspaceId: string | null,
    projectDescription: string,
    pricingHistory?: Array<{
      projectDescription: string;
      price: number;
      currency: string;
      date: string;
      accepted: boolean;
    }>,
    options?: AIGenerateOptions,
  ) {
    if (!this.openai) {
      throw new BadRequestException('AI service is not configured');
    }

    const model = options?.model || this.defaultModel;
    const prompt = this.promptService.renderPrompt('pricingAssistant', {
      projectDescription,
      pricingHistory: JSON.stringify(pricingHistory || []),
    });

    try {
      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a pricing consultant specializing in business proposals.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 1500,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('AI did not generate content');
      }

      const pricing = JSON.parse(content);

      const usage = completion.usage;
      const cost = this.calculateCost(
        model,
        usage?.prompt_tokens || 0,
        usage?.completion_tokens || 0,
      );

      await this.logUsage(userId, workspaceId, {
        tokens: usage?.total_tokens || 0,
        cost,
        model,
        action: 'pricing_recommendations',
      });

      return {
        recommendations: pricing,
        usage: {
          tokens: usage?.total_tokens || 0,
          cost,
          model,
        },
      };
    } catch (error) {
      this.logger.error('AI pricing error:', error);
      throw new BadRequestException(`AI pricing failed: ${error.message}`);
    }
  }

  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const pricing = this.modelPricing[model] || this.modelPricing[this.defaultModel];
    return (inputTokens / 1000) * pricing.input + (outputTokens / 1000) * pricing.output;
  }

  private async logUsage(
    userId: string,
    workspaceId: string | null,
    data: {
      tokens: number;
      cost: number;
      model: string;
      action: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<void> {
    try {
      // Access aIUsage - Prisma generates it dynamically, use type assertion
      // @ts-ignore - Prisma generates aIUsage at runtime but TypeScript types may not reflect it immediately
      await this.prisma.aIUsage.create({
        data: {
          userId,
          workspaceId,
          tokens: data.tokens,
          cost: data.cost,
          model: data.model,
          action: data.action,
          metadata: (data.metadata || {}) as Prisma.InputJsonValue,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log AI usage:', error);
      // Don't throw - usage logging shouldn't break the main flow
    }
  }

  private parseProposalSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionHeaders = [
      'Executive Summary',
      'Project Overview',
      'Proposed Solution',
      'Timeline',
      'Pricing',
      'Next Steps',
    ];

    let currentSection = 'introduction';
    let currentContent: string[] = [];

    const lines = content.split('\n');
    for (const line of lines) {
      const isHeader = sectionHeaders.some(
        (header) => line.trim().toLowerCase().includes(header.toLowerCase()),
      );

      if (isHeader) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.trim().toLowerCase().replace(/\s+/g, '_');
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return sections;
  }
}

