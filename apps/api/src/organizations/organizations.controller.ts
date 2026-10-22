import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

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
}
