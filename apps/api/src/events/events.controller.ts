import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService, private prisma: PrismaService) {}

  @Get()
  findAll(@Query('search') search?: string, @Query('isFest') isFest?: string) {
    const isFestBool = isFest === 'true' ? true : isFest === 'false' ? false : undefined;
    return this.eventsService.findAll(search, isFestBool);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateEventDto, @Req() req: any) {
    return this.eventsService.create(dto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  register(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.register(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cancel')
  cancelRegistration(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.cancelRegistration(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMyEvents(@Req() req: any) {
    return this.eventsService.findMyEvents(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel-event')
  cancelEvent(@Param('id') id: string, @Req() req: any) {
    return this.eventsService.cancelEvent(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('attendees/:regId')
  async markAttendance(@Param('regId') regId: string, @Body('status') status: string, @Req() req: any) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: regId }, include: { event: true }
    });
    if (!reg) throw new BadRequestException('Registration not found');

    // FLAW 8 FIX: Verify requester is CLUB_HEAD of the event's organization
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: req.user.userId, organizationId: reg.event.organizationId } }
    });
    if (!membership || (membership.role !== 'CLUB_HEAD' && membership.role !== 'COMMITTEE_MEMBER')) {
      throw new ForbiddenException('Only organizers can mark attendance.');
    }
    return this.eventsService.markAttendance(regId, status);
  }
}



