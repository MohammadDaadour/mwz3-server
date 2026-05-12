import { PartialType, OmitType } from '@nestjs/mapped-types';
import { User } from 'src/users/entities/user.entity';

export class MessageDto {
  readonly id?: number;
  value?: string;
  read?: boolean;
  tx?: number;
  sender?: User;
  rx?: number;
  receiver?: User;
  createdAt?: Date;
}

export class CreateMessageDto extends OmitType(MessageDto, [
  'id',
  'createdAt',
]) {
  value: string;
  tx: number;
  rx: number;
}

export class UpdateMessageDto extends PartialType(CreateMessageDto) {
  read?: boolean;
}
