import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll() {
    return this.eventsService.findAll();
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
}
