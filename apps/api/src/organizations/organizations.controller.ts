import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, Patch, Query, ForbiddenException, BadRequestException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService, 
    private prisma: PrismaService,
    private audit: AuditService
  ) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('category') category?: string) {
    return this.organizationsService.findAll(search, category);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('admin/all')
  findAllAdmin() { return this.organizationsService.findAllAdmin(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('pending')
  findPending() { return this.organizationsService.findPending(); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const res = await this.organizationsService.approve(id);
    await this.audit.logAction(req.user.userId, 'APPROVE_ORGANIZATION', id, `Approved club: ${res.name}`);
    return res;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/renew')
  async renew(@Param('id') id: string, @Req() req: any) {
    const res = await this.organizationsService.renew(id);
    await this.audit.logAction(req.user.userId, 'RENEW_ORGANIZATION', id, `Renewed club: ${res.name} until ${res.renewalDate.toLocaleDateString()}`);
    return res;
  }

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
  @Delete(':id/leave')
  leaveClub(@Param('id') id: string, @Req() req: any) {
    return this.organizationsService.leaveClub(id, req.user.userId);
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
    // FLAW 10 FIX: Verify the target user is a FACULTY
    const faculty = await this.prisma.user.findUnique({ where: { id: facultyId } });
    if (!faculty || faculty.globalRole !== 'FACULTY') {
      throw new BadRequestException('Can only assign a FACULTY user as a guardian.');
    }
    return this.prisma.organization.update({
      where: { id }, data: { facultyGuardianId: facultyId },
    });
  }

  @Get(':id')
  getOrganizationById(@Param('id') id: string) {
    return this.organizationsService.getOrganizationById(id);
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
  async updateMemberRole(@Param('memberId') memberId: string, @Body('role') role: any, @Req() req: any) {
    // FLAW 6 FIX: Verify requester is CLUB_HEAD of this specific organization
    const targetMembership = await this.prisma.membership.findUnique({ where: { id: memberId } });
    if (!targetMembership) throw new BadRequestException('Membership not found');
    
    // BUG 4 FIX: Prevent self-role change
    if (targetMembership.userId === req.user.userId) {
      throw new ForbiddenException('You cannot change your own role.');
    }
    if (!targetMembership) throw new BadRequestException('Membership not found');

    const requester = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.user.userId, organizationId: targetMembership.organizationId } }
    });

    if (!requester || requester.role !== 'CLUB_HEAD') {
      throw new ForbiddenException('Only the Club Head of this club can change member roles.');
    }

    return this.prisma.membership.update({ where: { id: memberId }, data: { role: role } });
  }
}



