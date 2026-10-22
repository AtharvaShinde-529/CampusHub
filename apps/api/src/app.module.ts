import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EventsModule } from './events/events.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';
import { FeedModule } from './feed/feed.module';
import { UsersModule } from './users/users.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, AuthModule, OrganizationsModule, EventsModule,
    OpportunitiesModule, FeedModule, UsersModule, RecruitmentModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
