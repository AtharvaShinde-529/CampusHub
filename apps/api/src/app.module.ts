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
import { NotificationsModule } from './notifications/notifications.module';
import { ExchangeModule } from './exchange/exchange.module';
import { MessagesModule } from './messages/messages.module';
import { SearchModule } from './search/search.module';
import { AuditModule } from './audit/audit.module';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, AuthModule, OrganizationsModule, EventsModule,
    OpportunitiesModule, FeedModule, UsersModule, RecruitmentModule,
    AnalyticsModule, NotificationsModule, ExchangeModule, MessagesModule, SearchModule, AuditModule, AnnouncementsModule,
  ],
})
export class AppModule {}




