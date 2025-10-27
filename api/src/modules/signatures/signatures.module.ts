import { Module } from '@nestjs/common';
import { SignaturesController } from './signatures.controller';
import { SignaturesService } from './signatures.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SignaturesController],
  providers: [SignaturesService, PrismaService],
  exports: [SignaturesService],
})
export class SignaturesModule {}
