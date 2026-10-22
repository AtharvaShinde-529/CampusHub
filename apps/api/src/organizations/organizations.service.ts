import { Injectable, ConflictException } from '@nestjs/common';
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

  async findPending() {
    return this.prisma.organization.findMany({
      where: { status: 'PENDING_REVIEW' },
      include: { memberships: { include: { user: true } } }
    });
  }

  async create(dto: CreateOrganizationDto, userId: string) {
    return this.prisma.organization.create({
      data: {
        name: dto.name, description: dto.description, category: dto.category, status: 'PENDING_REVIEW',
        memberships: { create: { userId: userId, role: 'CLUB_HEAD' } },
      },
    });
  }

  async approve(id: string) {
    return this.prisma.organization.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  async join(orgId: string, userId: string) {
    const existing = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (existing) throw new ConflictException('Already a member');
    return this.prisma.membership.create({ data: { userId, organizationId: orgId, role: 'MEMBER' } });
  }

  async findMyMemberships(userId: string) {
    return this.prisma.membership.findMany({ where: { userId, isActive: true }, include: { organization: true } });
  }

  async findGuardedOrgs(userId: string) {
    return this.prisma.organization.findMany({
      where: { facultyGuardianId: userId, status: 'ACTIVE' },
      include: { memberships: true }
    });
  }
}
