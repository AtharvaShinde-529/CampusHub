import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string) {
    if (!query || query.trim() === '') {
      return { users: [], organizations: [], events: [], opportunities: [] };
    }

    const searchString = query.trim();

    const [users, organizations, events, opportunities] = await Promise.all([
      // Search Users (Name or Email)
      this.prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: searchString, mode: 'insensitive' } },
            { studentProfile: { OR: [{ firstName: { contains: searchString, mode: 'insensitive' } }, { lastName: { contains: searchString, mode: 'insensitive' } }] } },
            { facultyProfile: { OR: [{ firstName: { contains: searchString, mode: 'insensitive' } }, { lastName: { contains: searchString, mode: 'insensitive' } }] } },
          ],
        },
        include: { studentProfile: true, facultyProfile: true },
        take: 5,
      }),
      // Search Organizations
      this.prisma.organization.findMany({
        where: { name: { contains: searchString, mode: 'insensitive' }, status: 'ACTIVE' },
        take: 5,
      }),
      // Search Events
      this.prisma.event.findMany({
        where: { title: { contains: searchString, mode: 'insensitive' }, status: 'PUBLISHED' },
        take: 5,
      }),
      // Search Opportunities
      this.prisma.opportunity.findMany({
        where: { title: { contains: searchString, mode: 'insensitive' }, status: 'PUBLISHED' },
        take: 5,
      }),
    ]);

    // Format users so frontend doesn't need complex logic
    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.studentProfile ? `${u.studentProfile.firstName} ${u.studentProfile.lastName}` : u.facultyProfile ? `${u.facultyProfile.firstName} ${u.facultyProfile.lastName}` : u.email,
      email: u.email,
      role: u.globalRole,
      avatarUrl: u.avatarUrl,
    }));

    return { users: formattedUsers, organizations, events, opportunities };
  }
}
