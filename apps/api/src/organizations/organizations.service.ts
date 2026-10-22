import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      where: { status: 'ACTIVE' },
    });
  }

  async create(dto: CreateOrganizationDto, userId: string) {
    return this.prisma.organization.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        status: 'ACTIVE',
        memberships: {
          create: {
            userId: userId,
            role: 'CLUB_HEAD',
          },
        },
      },
    });
  }

  async join(orgId: string, userId: string) {
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    if (existing) throw new ConflictException('Already a member of this organization');

    return this.prisma.membership.create({
      data: {
        userId,
        organizationId: orgId,
        role: 'MEMBER',
      },
    });
  }

  async findMyMemberships(userId: string) {
    return this.prisma.membership.findMany({
      where: { userId, isActive: true },
      include: { organization: true },
    });
  }
}
