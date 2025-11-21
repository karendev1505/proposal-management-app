import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';
import { PrismaService } from '../../../prisma.service';
import { PromptService } from './prompt.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

describe('AIService', () => {
  let service: AIService;
  let prisma: PrismaService;
  let promptService: PromptService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  const mockPrismaService = {
    aIUsage: {
      create: jest.fn(),
    },
  };

  const mockPromptService = {
    renderPrompt: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-api-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PromptService,
          useValue: mockPromptService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
    prisma = module.get<PrismaService>(PrismaService);
    promptService = module.get<PromptService>(PromptService);

    // Setup OpenAI mock
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;

    // Replace the OpenAI instance in service
    (service as any).openai = mockOpenAI;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateProposal', () => {
    const userId = 'user-1';
    const workspaceId = 'workspace-1';
    const input = {
      projectDescription: 'Build a web application',
      clientInfo: 'Tech company',
      tone: 'formal' as const,
      sections: ['overview', 'pricing'],
    };

    it('should successfully generate a proposal', async () => {
      const mockCompletion = {
        choices: [
          {
            message: {
              content: 'Generated proposal content',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 200,
          total_tokens: 300,
        },
      };

      mockPromptService.renderPrompt.mockReturnValue('Rendered prompt');
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockCompletion);
      mockPrismaService.aIUsage.create.mockResolvedValue({
        id: 'usage-1',
        tokens: 300,
        cost: 0.0001,
      });

      const result = await service.generateProposal(userId, workspaceId, input);

      expect(result).toBeDefined();
      expect(result.content).toBe('Generated proposal content');
      expect(result.usage.tokens).toBe(300);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(mockPrismaService.aIUsage.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if AI service is not configured', async () => {
      (service as any).openai = null;

      await expect(
        service.generateProposal(userId, workspaceId, input),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no content generated', async () => {
      const mockCompletion = {
        choices: [{}], // No message content
        usage: {
          total_tokens: 0,
        },
      };

      mockPromptService.renderPrompt.mockReturnValue('Rendered prompt');
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockCompletion);

      await expect(
        service.generateProposal(userId, workspaceId, input),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle OpenAI API errors', async () => {
      mockPromptService.renderPrompt.mockReturnValue('Rendered prompt');
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error'),
      );

      await expect(
        service.generateProposal(userId, workspaceId, input),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('improveSection', () => {
    const userId = 'user-1';
    const workspaceId = 'workspace-1';
    const section = 'Introduction section';
    const tone = 'persuasive';

    it('should successfully improve a section', async () => {
      const mockCompletion = {
        choices: [
          {
            message: {
              content: 'Improved section content',
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
      };

      mockPromptService.renderPrompt.mockReturnValue('Rendered prompt');
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockCompletion);
      mockPrismaService.aIUsage.create.mockResolvedValue({});

      const result = await service.improveSection(userId, workspaceId, section, tone);

      expect(result).toBeDefined();
      expect(result.improved).toBe('Improved section content');
      expect(result.original).toBe(section);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for gpt-4o-mini', () => {
      const cost = (service as any).calculateCost('gpt-4o-mini', 1000, 500);
      // gpt-4o-mini: input 0.00015, output 0.0006 per 1K tokens
      const expectedCost = (1000 / 1000) * 0.00015 + (500 / 1000) * 0.0006;
      expect(cost).toBeCloseTo(expectedCost, 6);
    });

    it('should calculate cost correctly for gpt-4o', () => {
      const cost = (service as any).calculateCost('gpt-4o', 1000, 500);
      // gpt-4o: input 0.0025, output 0.01 per 1K tokens
      const expectedCost = (1000 / 1000) * 0.0025 + (500 / 1000) * 0.01;
      expect(cost).toBeCloseTo(expectedCost, 6);
    });
  });
});

