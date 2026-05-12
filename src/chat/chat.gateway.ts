import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { forwardRef, Inject } from '@nestjs/common';


@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    private jwtService: JwtService,
  ) { }

  // عند الاتصال
  handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('error', { message: 'Token missing' });
      client.disconnect();
      return;
    }

    try {
      const payload: any = this.jwtService.verify(token);

      // التحقق من الـ payload
      if (!payload.sub || !payload.role || !['admin', 'vip'].includes(payload.role)) {
        throw new Error('Invalid payload');
      }

      // نخزن البيانات في الـ client
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      // نضيف اليوزر للـ room الخاص بيه
      const roomName = payload.role === 'admin' ? `admin` : `vip_${payload.sub}`;
      client.join(roomName);

      console.log(`${payload.role.toUpperCase()} ${payload.sub} connected to chat → room: ${roomName}`);
    } catch (err) {
      console.log('Chat connection rejected:', err.message);
      client.emit('error', { message: 'Invalid or expired token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      console.log(`${client.data.role} ${client.data.userId} disconnected from chat`);
    }
  }

  // إرسال رسالة
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { message: string; receiverId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    const senderRole = client.data.role as 'admin' | 'vip';

    if (!senderId || !senderRole || !data.message?.trim()) return;

    let receiverId: number;
    let receiverRole: 'admin' | 'vip';

    if (senderRole === 'vip') {
      receiverId = 1; // الأدمن دايمًا ID = 1
      receiverRole = 'admin';
    } else {
      if (!data.receiverId) {
        client.emit('error', { message: 'receiverId required for admin' });
        return;
      }
      receiverId = data.receiverId;
      receiverRole = 'vip';
    }

    await this.chatService.sendMessage(
      senderRole,
      senderId,
      receiverRole,
      receiverId,
      data.message.trim(),
    );
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const role = client.data.role as 'admin' | 'vip';

    if (!userId || !role) return;

    const partnerId = role === 'vip' ? 1 : userId;
    const partnerRole = role === 'vip' ? 'admin' : 'vip';

    const messages = await this.chatService.getConversation(
      role,
      userId,
      partnerRole,
      partnerId,
    );

    client.emit('chatHistory', messages);
    await this.chatService.markAsRead(role, userId, partnerRole, partnerId);
  }
}