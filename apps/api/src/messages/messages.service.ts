import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: { sender: true, receiver: true },
    });

    const usersMap = new Map();
    messages.forEach(msg => {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!usersMap.has(otherUser.id)) {
        usersMap.set(otherUser.id, {
          id: otherUser.id,
          email: otherUser.email,
          avatarUrl: otherUser.avatarUrl,
          latestMessage: msg.content,
          createdAt: msg.createdAt,
        });
      }
    });
    return Array.from(usersMap.values());
  }

  async getMessages(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    // FLAW FIX: Cannot message yourself
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a message to yourself.');
    }
    // FLAW 12 FIX: Check if receiver exists
    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) throw new NotFoundException('Receiver does not exist.');

    return this.prisma.message.create({
      data: { senderId, receiverId, content },
    });
  }
}

