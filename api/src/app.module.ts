import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { EmailsModule } from './modules/emails/emails.module';
import { UsersModule } from './modules/users/users.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { StatsModule } from './modules/stats/stats.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    EmailsModule,
    UsersModule,
    ProposalsModule,
    TemplatesModule,
    SignaturesModule,
    StatsModule,
    NotificationsModule,
    FilesModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
