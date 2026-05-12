import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Ad } from 'src/ads/entities/ad.entity';
import { User } from 'src/users/entities/user.entity';

export class CommentDto {
  readonly id?: number;
  value?: string;
  createdAt?: Date;
  ad?: Ad;
  adFK?: number;
  user?: User;
  userFK?: number;
}

export class CreateCommentDto extends OmitType(CommentDto, [
  'id',
  'createdAt',
]) {
  value?: string;
  adFK?: number;
  userFK?: number;
}

export class UpdateCommentDto extends PartialType(CreateCommentDto) {}
