import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, isFest?: boolean) {
    return this.prisma.event.findMany({
      where: { 
        status: 'PUBLISHED',
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        ...(isFest !== undefined && { isFest: isFest }),
      },
      include: { organization: true, registrations: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(dto: CreateEventDto, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: dto.organizationId } },
    });

    if (!membership || (membership.role !== 'CLUB_HEAD' && membership.role !== 'COMMITTEE_MEMBER')) {
      throw new ForbiddenException('Only Club Heads can create events');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title, description: dto.description, startDate: new Date(dto.startDate), endDate: new Date(dto.endDate),
        organizationId: dto.organizationId, status: 'PUBLISHED', isFest: dto.isFest || false, parentEventId: dto.parentEventId || null,
        maxCapacity: dto.maxCapacity || null,
      },
    });
  }

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true }
    });
    if (!event) throw new NotFoundException('Event not found');

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (existing) throw new ConflictException('Already registered or waitlisted');

    let status = 'REGISTERED';
    if (event.maxCapacity) {
      const registeredCount = event.registrations.filter(r => r.status === 'REGISTERED').length;
      if (registeredCount >= event.maxCapacity) {
        status = 'WAITLISTED';
      }
    }

    return this.prisma.eventRegistration.create({
      data: { userId, eventId, status },
    });
  }

  async cancelRegistration(eventId: string, userId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { userId_eventId: { userId, eventId } }
    });
    if (!reg) throw new NotFoundException('Registration not found');

    await this.prisma.eventRegistration.delete({ where: { id: reg.id } });

    // If the cancelled person was REGISTERED, promote the first WAITLISTED person
    if (reg.status === 'REGISTERED') {
      const nextInLine = await this.prisma.eventRegistration.findFirst({
        where: { eventId, status: 'WAITLISTED' },
        orderBy: { id: 'asc' }
      });
      if (nextInLine) {
        await this.prisma.eventRegistration.update({
          where: { id: nextInLine.id },
          data: { status: 'REGISTERED' }
        });
      }
    }
    return { message: 'Registration cancelled successfully' };
  }

  async findMyEvents(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      include: { event: { include: { organization: true } } },
    });
  }

  async getEventAttendees(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: { user: { include: { studentProfile: true } } },
      orderBy: { user: { studentProfile: { firstName: 'asc' } } }
    });
  }

  async markAttendance(registrationId: string, status: string) {
    return this.prisma.eventRegistration.update({
      where: { id: registrationId },
      data: { status }
    });
  }
}
