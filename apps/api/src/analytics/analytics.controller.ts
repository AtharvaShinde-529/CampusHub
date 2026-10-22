import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async getStats() {
    const students = await this.prisma.user.count({ where: { globalRole: 'STUDENT' } });
    const faculty = await this.prisma.user.count({ where: { globalRole: 'FACULTY' } });
    const clubs = await this.prisma.organization.count({ where: { status: 'ACTIVE' } });
    const pendingClubs = await this.prisma.organization.count({ where: { status: 'PENDING_REVIEW' } });
    const events = await this.prisma.event.count();
    const opportunities = await this.prisma.opportunity.count({ where: { status: 'PUBLISHED' } });
    return { students, faculty, clubs, pendingClubs, events, opportunities };
  }
}
