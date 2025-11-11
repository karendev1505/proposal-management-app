import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config/validation.schema';
import { AppController } from './app.controller';
import { SharedModule } from './modules/shared/shared.module';
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
import { HealthModule } from './modules/health/health.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validationSchema: configValidationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    SharedModule,
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
    HealthModule,
    PlansModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
