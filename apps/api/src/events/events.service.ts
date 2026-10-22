import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      include: { organization: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(dto: CreateEventDto, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: dto.organizationId } },
    });

    if (!membership || (membership.role !== 'CLUB_HEAD' && membership.role !== 'COMMITTEE_MEMBER')) {
      throw new ForbiddenException('Only Club Heads or Committee Members can create events');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        organizationId: dto.organizationId,
        status: 'PUBLISHED',
        isFest: dto.isFest || false,
        parentEventId: dto.parentEventId || null,
      },
    });
  }

  async register(eventId: string, userId: string) {
    const existing = await this.prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new ConflictException('Already registered');

    return this.prisma.eventRegistration.create({
      data: { userId, eventId, status: 'REGISTERED' },
    });
  }

  async findMyEvents(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: { include: { organization: true } } },
    });
  }
}
