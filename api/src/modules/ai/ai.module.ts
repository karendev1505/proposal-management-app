import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './services/ai.service';
import { PromptService } from './services/prompt.service';
import { DocumentParserService } from './services/document-parser.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [AIController],
  providers: [
    AIService,
    PromptService,
    DocumentParserService,
    PrismaService,
  ],
  exports: [AIService, DocumentParserService],
})
export class AIModule {}

