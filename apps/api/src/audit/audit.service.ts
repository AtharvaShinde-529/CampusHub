import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(userId: string, action: string, targetId?: string, details?: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, targetId, details }
    });
  }

  async getLogs() {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { email: true, globalRole: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to last 100 logs
    });
  }
}
