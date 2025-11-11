import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SignaturesController } from './signatures.controller';
import { SignaturesService } from './signatures.service';
import { PrismaService } from '../../prisma.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    FilesModule,
  ],
  controllers: [SignaturesController],
  providers: [SignaturesService, PrismaService],
  exports: [SignaturesService],
})
export class SignaturesModule {}
