import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './entities/comment.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateCommentDto } from './entities/comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment)
    private model: typeof Comment,
  ) {}

  async getAdComments(ad: number) {
    return await this.model.findAll({
      where: { adFK: ad },
      order: [['createdAt', 'DESC']],
      include: { model: User, attributes: ['id', 'label'] },
    });
  }

  async create(dto: CreateCommentDto) {
    return await this.model.create({ ...dto });
  }

  async delete(id: number) {
    return await this.model.destroy({ where: { id: id } });
  }
}
