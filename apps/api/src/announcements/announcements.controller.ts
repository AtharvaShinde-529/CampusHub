import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.announcementsService.create(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':orgId')
  getClubAnnouncements(@Param('orgId') orgId: string) {
    return this.announcementsService.getClubAnnouncements(orgId);
  }
}
