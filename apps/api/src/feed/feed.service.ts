import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getUnifiedFeed() {
    const [events, opportunities, clubs] = await Promise.all([
      this.prisma.event.findMany({
        where: { status: 'PUBLISHED', startDate: { gte: new Date() } },
        take: 5,
        orderBy: { startDate: 'asc' },
        include: { organization: true },
      }),
      this.prisma.opportunity.findMany({
        where: { status: 'PUBLISHED', deadline: { gte: new Date() } },
        take: 5,
        orderBy: { deadline: 'asc' },
      }),
      this.prisma.organization.findMany({
        where: { status: 'ACTIVE' },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { events, opportunities, clubs };
  }
}
