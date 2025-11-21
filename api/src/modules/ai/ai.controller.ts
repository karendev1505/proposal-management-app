import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { PlanLimitGuard, PlanLimit } from '../../common/guards/plan-limit.guard';
import { AIService } from './services/ai.service';
import { DocumentParserService } from './services/document-parser.service';
import { GenerateProposalDto } from './dto/generate-proposal.dto';
import { ImproveSectionDto } from './dto/improve-section.dto';
import { RewriteToneDto } from './dto/rewrite-tone.dto';
import { PricingRecommendationsDto } from './dto/pricing-recommendations.dto';
// Shared types - will be available after package setup
interface AuthenticatedRequest extends Express.Request {
  user: {
    id: string;
    userId?: string;
    email: string;
    name: string;
    role: string;
    activeWorkspaceId?: string | null;
  };
  correlationId?: string;
  workspaceId?: string;
  workspaceRole?: string;
  query?: {
    workspaceId?: string;
    [key: string]: unknown;
  };
}

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private aiService: AIService,
    private documentParser: DocumentParserService,
  ) {}

  @Post('proposals/generate')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @UseGuards(PlanLimitGuard)
  @PlanLimit('ai_generate')
  async generateProposal(
    @Request() req: AuthenticatedRequest,
    @Body() dto: GenerateProposalDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.aiService.generateProposal(userId, workspaceId, dto, {
      model: dto.model,
    });
  }

  @Post('proposals/improve')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @UseGuards(PlanLimitGuard)
  @PlanLimit('ai_improve')
  async improveSection(@Request() req: AuthenticatedRequest, @Body() dto: ImproveSectionDto) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.aiService.improveSection(
      userId,
      workspaceId,
      dto.section,
      dto.tone || 'professional',
      {
        model: dto.model,
      },
    );
  }

  @Post('proposals/rewrite-tone')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @UseGuards(PlanLimitGuard)
  @PlanLimit('ai_rewrite')
  async rewriteTone(@Request() req: AuthenticatedRequest, @Body() dto: RewriteToneDto) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.aiService.rewriteTone(
      userId,
      workspaceId,
      dto.text,
      dto.targetTone,
      {
        model: dto.model,
      },
    );
  }

  @Post('pricing/recommendations')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @UseGuards(PlanLimitGuard)
  @PlanLimit('ai_pricing')
  async getPricingRecommendations(
    @Request() req: AuthenticatedRequest,
    @Body() dto: PricingRecommendationsDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.aiService.getPricingRecommendations(
      userId,
      workspaceId,
      dto.projectDescription,
      dto.pricingHistory,
    );
  }

  @Post('extract')
  @UseInterceptors(FileInterceptor('file'))
  async extractFromDocument(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.documentParser.extractDataFromDocument(userId, workspaceId, file);
  }

  @Post('convert-document')
  @UseInterceptors(FileInterceptor('file'))
  async convertDocumentToProposal(
    @Request() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
    @Body('tone') tone?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.documentParser.convertDocumentToProposal(
      userId,
      workspaceId,
      file,
      tone || 'formal',
    );
  }
}

