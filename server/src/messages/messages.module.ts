import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/messages.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [SequelizeModule.forFeature([Message]), UsersModule],
  exports: [SequelizeModule],
})
export class MessagesModule {}
