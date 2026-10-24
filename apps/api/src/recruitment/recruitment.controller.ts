import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private prisma: PrismaService) {}

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
    if (req.user.role !== 'STUDENT') {
      throw new ForbiddenException('Only students can apply for club recruitment.');
    }

    const cycle = await this.prisma.recruitmentCycle.findUnique({ where: { id } });
    if (!cycle) throw new BadRequestException('Cycle not found');

    if (new Date(cycle.deadline) < new Date()) {
      throw new BadRequestException('The deadline for this recruitment has passed.');
    }

    const existingMember = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.user.userId, organizationId: cycle.organizationId } }
    });
    if (existingMember) {
      throw new BadRequestException('You are already a member of this club.');
    }

    return this.prisma.application.create({
      data: { recruitmentCycleId: id, userId: req.user.userId, pitch },
      include: { recruitmentCycle: { include: { organization: { include: { memberships: { where: { role: 'CLUB_HEAD' } } } } } } }
    });
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
  async updateAppStatus(@Param('id') id: string, @Body('status') status: string, @Req() req: any) {
    const app = await this.prisma.application.findUnique({
      where: { id },
      include: { recruitmentCycle: true }
    });
    if (!app) throw new BadRequestException('Application not found');

    // FLAW 7 FIX: Verify requester is CLUB_HEAD of the organization
    const requester = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.user.userId, organizationId: app.recruitmentCycle.organizationId } }
    });
    if (!requester || requester.role !== 'CLUB_HEAD') {
      throw new ForbiddenException('Only the Club Head can update application statuses.');
    }

    const updatedApp = await this.prisma.application.update({ where: { id }, data: { status } });

    // FLAW 1 FIX: If ACCEPTED, create a Membership
    if (status === 'ACCEPTED') {
      const existingMembership = await this.prisma.membership.findUnique({
        where: { userId_organizationId: { userId: app.userId, organizationId: app.recruitmentCycle.organizationId } }
      });
      if (!existingMembership) {
        await this.prisma.membership.create({
          data: { userId: app.userId, organizationId: app.recruitmentCycle.organizationId, role: 'MEMBER' }
        });
      }
    }
    return updatedApp;
  }
}
