import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // Map to store active connections: userId -> socketId
  private activeUsers = new Map<string, string>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or headers
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new UnauthorizedException('No token provided');

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      
      // Store the mapping
      this.activeUsers.set(payload.sub, client.id);
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { receiverId: string, content: string },
    @ConnectedSocket() client: Socket
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    // 1. Save to Database
    const newMessage = await this.messagesService.sendMessage(senderId, data.receiverId, data.content);
    
    // 2. Emit ONLY to the receiver and the sender
    const receiverSocketId = this.activeUsers.get(data.receiverId);
    const senderSocketId = this.activeUsers.get(senderId);

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', newMessage);
    }
    if (senderSocketId) {
      this.server.to(senderSocketId).emit('newMessage', newMessage);
    }
  }
}
