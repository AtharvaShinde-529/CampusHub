import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService, private prisma: PrismaService) {}

  @Get()
  findAll() { return this.organizationsService.findAll(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  findPending() { return this.organizationsService.findPending(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.organizationsService.approve(id); }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateOrganizationDto, @Req() req: any) {
    return this.organizationsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  join(@Param('id') id: string, @Req() req: any) {
    return this.organizationsService.join(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyOrgs(@Req() req: any) {
    return this.organizationsService.findMyMemberships(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FACULTY')
  @Get('guarded')
  getGuardedOrgs(@Req() req: any) {
    return this.organizationsService.findGuardedOrgs(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/guardian')
  async assignGuardian(@Param('id') id: string, @Body('facultyId') facultyId: string) {
    return this.prisma.organization.update({
      where: { id },
      data: { facultyGuardianId: facultyId },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  async getMembers(@Param('id') id: string) {
    return this.prisma.membership.findMany({
      where: { organizationId: id, isActive: true },
      include: { user: { include: { studentProfile: true, facultyProfile: true } } }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch('members/:memberId')
  async updateMemberRole(@Param('memberId') memberId: string, @Body('role') role: any) {
    return this.prisma.membership.update({
      where: { id: memberId },
      data: { role: role }
    });
  }
}
