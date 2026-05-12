import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatGateway } from './chat.gateway';
import { User } from '../users/entities/user.entity';
import { VipUser } from '../vip-management/entities/vip-user.entity';
import { Op } from 'sequelize';
import { forwardRef, Inject } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatMessage)
    private chatModel: typeof ChatMessage,

     @Inject(forwardRef(() => ChatGateway))
    private gateway: ChatGateway,
  ) {}

  async sendMessage(
    senderType: 'admin' | 'vip',
    senderId: number,
    receiverType: 'admin' | 'vip',
    receiverId: number,
    message: string,
  ) {
    const data: any = { message };

    if (senderType === 'admin') data.senderUserId = senderId;
    else data.senderVipUserId = senderId;

    if (receiverType === 'admin') data.receiverUserId = receiverId;
    else data.receiverVipUserId = receiverId;

    const msg = await this.chatModel.create(data);

    const fullMsg = await this.chatModel.findByPk(msg.id, {
      include: [
        { model: User, as: 'senderUser', attributes: ['id', 'name'] },
        { model: VipUser, as: 'senderVipUser', attributes: ['id', 'name'] },
        { model: User, as: 'receiverUser', attributes: ['id', 'name'] },
        { model: VipUser, as: 'receiverVipUser', attributes: ['id', 'name'] },
      ],
    });

    // إرسال للـ rooms الصحيحة
    const vipRoom = senderType === 'vip' ? `vip_${senderId}` : `vip_${receiverId}`;
    this.gateway.server.to('admin').to(vipRoom).emit('newMessage', fullMsg);

    return fullMsg;
  }

  // جلب المحادثة بين VIP و Admin
  async getConversation(
    userType: 'admin' | 'vip',
    userId: number,
    partnerType: 'admin' | 'vip',
    partnerId: number,
  ) {
    const where: any = { [Op.or]: [] };

    if (userType === 'vip' && partnerType === 'admin') {
      where[Op.or].push(
        { senderVipUserId: userId, receiverUserId: partnerId },
        { senderUserId: partnerId, receiverVipUserId: userId },
      );
    } else if (userType === 'admin' && partnerType === 'vip') {
      where[Op.or].push(
        { senderUserId: userId, receiverVipUserId: partnerId },
        { senderVipUserId: partnerId, receiverUserId: userId },
      );
    }

    return this.chatModel.findAll({
      where,
      include: [
        { model: User, as: 'senderUser', attributes: ['id', 'name'] },
        { model: VipUser, as: 'senderVipUser', attributes: ['id', 'name'] },
        { model: User, as: 'receiverUser', attributes: ['id', 'name'] },
        { model: VipUser, as: 'receiverVipUser', attributes: ['id', 'name'] },
      ],
      order: [['sentAt', 'ASC']],
      limit: 100,
    });
  }

  async markAsRead(
    receiverType: 'admin' | 'vip',
    receiverId: number,
    senderType: 'admin' | 'vip',
    senderId: number,
  ) {
    const where: any = {};

    if (receiverType === 'vip') where.receiverVipUserId = receiverId;
    else where.receiverUserId = receiverId;

    if (senderType === 'vip') where.senderVipUserId = senderId;
    else where.senderUserId = senderId;

    where.isRead = false;

    await this.chatModel.update({ isRead: true }, { where });
  }
}