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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../common/guards/workspace.guard';
import { AIService } from './services/ai.service';
import { DocumentParserService } from './services/document-parser.service';
import { GenerateProposalDto } from './dto/generate-proposal.dto';
import { ImproveSectionDto } from './dto/improve-section.dto';
import { RewriteToneDto } from './dto/rewrite-tone.dto';
import { PricingRecommendationsDto } from './dto/pricing-recommendations.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(
    private aiService: AIService,
    private documentParser: DocumentParserService,
  ) {}

  @Post('proposals/generate')
  async generateProposal(
    @Request() req: any,
    @Body() dto: GenerateProposalDto,
  ) {
    const userId = req.user.userId || req.user.id;
    const workspaceId = req.user.activeWorkspaceId || req.query?.workspaceId;

    return this.aiService.generateProposal(userId, workspaceId, dto, {
      model: dto.model,
    });
  }

  @Post('proposals/improve')
  async improveSection(@Request() req: any, @Body() dto: ImproveSectionDto) {
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
  async rewriteTone(@Request() req: any, @Body() dto: RewriteToneDto) {
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
  async getPricingRecommendations(
    @Request() req: any,
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
    @Request() req: any,
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
    @Request() req: any,
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

