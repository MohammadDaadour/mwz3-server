import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatMessage } from './entities/chat-message.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([ChatMessage]),
    
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret_make_it_long',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,  
  ],
  exports: [ChatService],
})
export class ChatModule {}