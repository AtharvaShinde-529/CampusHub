import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getRecommendations(userId: string) {
    // 1. Get user's skills and interests
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) return { clubs: [], events: [], opportunities: [] };

    const keywords = [...(profile.skills || []), ...(profile.interests || [])].map(k => k.toLowerCase());

    // If user has no skills/interests, return empty
    if (keywords.length === 0) return { clubs: [], events: [], opportunities: [] };

    // 2. Fetch all active data
    const myMemberships = await this.prisma.membership.findMany({ where: { userId } });
    const joinedOrgIds = myMemberships.map(m => m.organizationId);

    const [clubs, events, opportunities] = await Promise.all([
      this.prisma.organization.findMany({ where: { status: 'ACTIVE' } }),
      this.prisma.event.findMany({ where: { status: 'PUBLISHED' }, include: { organization: true } }),
      this.prisma.opportunity.findMany({ where: { status: 'PUBLISHED' } }),
    ]);

    // 3. Simple Rule-Based Matching Function
    const isMatch = (text: string) => {
      if (!text) return false;
      const lowerText = text.toLowerCase();
      return keywords.some(kw => lowerText.includes(kw));
    };

    const matchedClubs = clubs.filter(c => 
      !joinedOrgIds.includes(c.id) && (isMatch(c.name) || isMatch(c.category) || isMatch(c.description))
    ).slice(0, 3); // Top 3

    const matchedEvents = events.filter(e => 
      isMatch(e.title) || isMatch(e.description) || (e.organization && isMatch(e.organization.name))
    ).slice(0, 3); // Top 3

    const matchedOpps = opportunities.filter(o => 
      isMatch(o.title) || isMatch(o.description) || isMatch(o.category)
    ).slice(0, 3); // Top 3

    return { clubs: matchedClubs, events: matchedEvents, opportunities: matchedOpps };
  }
}

