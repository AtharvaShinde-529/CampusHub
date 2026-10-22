import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findApproved(search?: string, category?: string) {
    return this.prisma.opportunity.findMany({
      where: { 
        status: 'PUBLISHED',
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        ...(category && { category: { equals: category, mode: 'insensitive' } }),
      },
      orderBy: { deadline: 'asc' },
    });
  }

  async findPending() {
    return this.prisma.opportunity.findMany({ where: { status: 'PENDING_MODERATION' }, orderBy: { createdAt: 'desc' } });
  }

  async create(dto: CreateOpportunityDto, userId: string) {
    return this.prisma.opportunity.create({
      data: { title: dto.title, description: dto.description, category: dto.category, deadline: new Date(dto.deadline), publisherId: userId, status: 'PENDING_MODERATION' },
    });
  }

  async approve(id: string) {
    return this.prisma.opportunity.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }
}
