import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AnnouncementsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService
  ) {}

  async create(data: { title: string, content: string, organizationId: string }, userId: string) {
    // 1. Verify user is a Club Head
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: data.organizationId } },
    });

    if (!membership || (membership.role !== 'CLUB_HEAD' && membership.role !== 'COMMITTEE_MEMBER')) {
      throw new ForbiddenException('Only Club Heads can post announcements');
    }

    // 2. Create the announcement
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        organizationId: data.organizationId,
      },
    });

    // 3. Find all members of the club to notify
    const members = await this.prisma.membership.findMany({
      where: { organizationId: data.organizationId, isActive: true },
    });

    // 4. Send notifications to everyone (except the sender)
    const org = await this.prisma.organization.findUnique({ where: { id: data.organizationId } });
    const orgName = org?.name || 'Club'; // FIX: Added fallback for TypeScript

    const promises = members
      .filter(m => m.userId !== userId) // Don't notify the sender
      .map(m => this.notifications.create(m.userId, `?? ${orgName} Announcement`, data.title));

    await Promise.all(promises);

    return announcement;
  }

  async getClubAnnouncements(orgId: string) {
    return this.prisma.announcement.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
