import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './entities/messages.entity';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UsersService } from 'src/users/users.service';
import { CreateMessageDto } from './entities/messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private model: typeof Message,
    private usersServive: UsersService,
    private sql: Sequelize,
  ) {}

  async findThreads(id: number) {
    const base: { rx: number; tx: number }[] = await this.sql.query(
      `SELECT DISTINCT rx, tx FROM messages WHERE rx = $1 OR tx = $1;`,
      { bind: [id], type: QueryTypes.SELECT },
    );

    const threads = [];
    base.forEach((item) => {
      if (!threads.includes(item.rx) && item.rx !== id && item.rx !== 2) {
        threads.push(item.rx);
      }
      if (!threads.includes(item.rx) && item.tx !== id && item.tx !== 2) {
        threads.push(item.tx);
      }
    });

    const users = await this.usersServive.findManyParam(threads);
    return users;
  }

  async findMessages(user: number, partner: number) {
    return await this.model.findAll({
      where: {
        [Op.or]: [
          { rx: user, tx: partner },
          { rx: partner, tx: user },
        ],
      },
      order: ['createdAt'],
    });
  }

  async sendMessage(dto: CreateMessageDto) {
    await this.model.create({ ...dto });
  }

  async markRead(tx: number, rx: number) {
    await this.sql.query(
      `UPDATE messages SET "read" = true WHERE tx = $1 AND rx = $2;`,
      { bind: [tx, rx], type: QueryTypes.BULKUPDATE },
    );
  }

  async findNotifications(id: number) {
    const count = await this.model.count({ where: { rx: id, read: false } });
    if (!count) {
      return 0;
    } else return count;
  }

  async findNewThreads(id: number) {
    const base: {tx: number}[] = await this.sql.query(
      `SELECT DISTINCT tx FROM messages WHERE "read" = false AND rx = $1;`,
      { bind: [id], type: QueryTypes.SELECT },
    );

    const results = []
    base.forEach(item => results.push(item.tx))

    // if (!results) {
    //   return [];
    // } else {
      return results
    // }
  }
}
