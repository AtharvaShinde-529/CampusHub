import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string, receiverId: string, content: string },
    @ConnectedSocket() client: Socket
  ) {
    // 1. Save to Database
    const newMessage = await this.messagesService.sendMessage(data.senderId, data.receiverId, data.content);
    
    // 2. Broadcast the message to the receiver and the sender
    this.server.emit('newMessage', newMessage);
  }
}
