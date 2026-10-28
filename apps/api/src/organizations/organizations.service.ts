import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, category?: string) {
    return this.prisma.organization.findMany({
      where: { 
        status: 'ACTIVE',
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(category && { category: { equals: category, mode: 'insensitive' } }),
      },
    });
  }

  // FIX: Restored the missing Admin method
  async findAllAdmin() {
    return this.prisma.organization.findMany({
      include: { memberships: true },
      orderBy: { renewalDate: 'asc' }
    });
  }

  async findPending() {
    return this.prisma.organization.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { memberships: { include: { user: true } } }
    });
  }

  async create(dto: CreateOrganizationDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.globalRole !== 'STUDENT') {
      throw new ForbiddenException('Only students can create clubs and be assigned as Club Head.');
    }

    const renewalDate = new Date();
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    return this.prisma.organization.create({
      data: {
        name: dto.name, description: dto.description, category: dto.category, status: 'PENDING_REVIEW',
        renewalDate: renewalDate,
        memberships: { create: { userId: userId, role: 'CLUB_HEAD' } },
      },
    });
  }

  async approve(id: string) {
    return this.prisma.organization.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async renew(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    // DESIGN 1 FIX: Base from today if expired, otherwise extend from current date
    const baseDate = org.renewalDate > new Date() ? org.renewalDate : new Date();
    const newRenewalDate = new Date(baseDate);
    newRenewalDate.setFullYear(baseDate.getFullYear() + 1);
    return this.prisma.organization.update({ where: { id }, data: { renewalDate: newRenewalDate } });
  }

  async join(orgId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.globalRole !== 'STUDENT') {
      throw new ForbiddenException('Only students can join clubs as members.');
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (existing) throw new ConflictException('Already a member');
    return this.prisma.membership.create({ data: { userId, organizationId: orgId, role: 'MEMBER' } });
  }

  async leaveClub(orgId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } }
    });
    if (!membership) throw new NotFoundException('Membership not found');
    if (membership.role === 'CLUB_HEAD') throw new ForbiddenException('Club Heads cannot leave. Transfer ownership first.');
    
    return this.prisma.membership.delete({ where: { id: membership.id } });
  }

  async findMyMemberships(userId: string) {
    return this.prisma.membership.findMany({ where: { userId, isActive: true }, include: { organization: true } });
  }

  async getOrganizationById(id: string) {
    return this.prisma.organization.findUnique({
      where: { id },
      include: {
        memberships: {
          where: { isActive: true },
          include: { user: { include: { studentProfile: true, facultyProfile: true } } }
        },
        events: {
          where: { status: 'PUBLISHED' },
          orderBy: { startDate: 'asc' },
          take: 10
        },
        announcements: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        recruitmentCycles: {
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' }
        },
        facultyGuardian: {
          include: { facultyProfile: true }
        }
      }
    });
  }

  async findGuardedOrgs(userId: string) {
    return this.prisma.organization.findMany({
      where: { facultyGuardianId: userId, status: 'ACTIVE' },
      include: { memberships: true }
    });
  }
}



