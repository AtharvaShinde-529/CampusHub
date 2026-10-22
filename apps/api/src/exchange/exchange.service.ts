import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExchangeService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, type?: string) {
    return this.prisma.exchangeItem.findMany({
      where: {
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        ...(type && { type: type }),
      },
      include: { user: { include: { studentProfile: true, facultyProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, userId: string) {
    return this.prisma.exchangeItem.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        userId: userId,
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.exchangeItem.update({
      where: { id },
      data: { status },
    });
  }
}
