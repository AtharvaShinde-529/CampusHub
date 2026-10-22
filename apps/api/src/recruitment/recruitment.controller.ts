import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('recruitment')
export class RecruitmentController {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  @Get()
  getOpenCycles() {
    return this.prisma.recruitmentCycle.findMany({
      where: { status: 'OPEN' },
      include: { organization: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createCycle(@Req() req: any, @Body() body: any) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.user.userId, organizationId: body.organizationId } },
    });
    if (!membership || (membership.role !== 'CLUB_HEAD' && membership.role !== 'COMMITTEE_MEMBER')) {
      throw new ForbiddenException('Only Club Heads can post recruitment notices.');
    }
    return this.prisma.recruitmentCycle.create({
      data: { title: body.title, description: body.description, deadline: new Date(body.deadline), organizationId: body.organizationId }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  async apply(@Param('id') id: string, @Req() req: any, @Body('pitch') pitch: string) {
    const application = await this.prisma.application.create({
      data: { recruitmentCycleId: id, userId: req.user.userId, pitch },
      include: { recruitmentCycle: { include: { organization: { include: { memberships: { where: { role: 'CLUB_HEAD' } } } } } } }
    });
    
    // Notify Club Head
    const headId = application.recruitmentCycle.organization.memberships[0]?.userId;
    if (headId) {
      await this.notifications.create(headId, 'New Application', 'A student has applied to your recruitment cycle.');
    }
    return application;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/applications')
  getApplications(@Param('id') id: string) {
    return this.prisma.application.findMany({
      where: { recruitmentCycleId: id },
      include: { user: { include: { studentProfile: true } } }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('applications/:id')
  async updateAppStatus(@Param('id') id: string, @Body('status') status: string) {
    const app = await this.prisma.application.update({
      where: { id }, data: { status }
    });
    
    // Notify Student
    await this.notifications.create(app.userId, `Application ${status}`, `Your application status has been updated to ${status}.`);
    return app;
  }
}
