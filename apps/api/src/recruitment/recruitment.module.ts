import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [RecruitmentController],
})
export class RecruitmentModule {}
