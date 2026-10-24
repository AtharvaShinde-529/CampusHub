import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  getConversations(@Req() req: any) {
    return this.messagesService.getConversations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getMessages(@Req() req: any, @Param('userId') otherUserId: string) {
    return this.messagesService.getMessages(req.user.userId, otherUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  sendMessage(@Req() req: any, @Body() body: { receiverId: string; content: string }) {
    return this.messagesService.sendMessage(req.user.userId, body.receiverId, body.content);
  }
}
