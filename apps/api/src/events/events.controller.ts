import { Controller, Get, Post, Body, Param, UseGuards, Req, Query, Patch } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

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
  @Get('my')
  getMyEvents(@Req() req: any) {
    return this.eventsService.findMyEvents(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  getAttendees(@Param('id') id: string) {
    return this.eventsService.getEventAttendees(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('attendees/:regId')
  markAttendance(@Param('regId') regId: string, @Body('status') status: string) {
    return this.eventsService.markAttendance(regId, status);
  }
}
