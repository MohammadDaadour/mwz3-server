import { PartialType, OmitType } from '@nestjs/mapped-types';
import { SubType } from 'src/substypes/entities/subtype.entity';
import { User } from 'src/users/entities/user.entity';

export class SubDto {
  readonly id?: number;
  active: boolean;
  activatedAt?: Date;
  endsAt?: Date;
  createdAt?: Date;
  deletedAt?: Date;
  user?: User;
  subType?: SubType;
}

export class CreateSubDto extends OmitType(SubDto, [
  'id',
  'createdAt',
  'deletedAt',
]) {
  userFK: number;
  subTypeFK: number;
}

export class UpdateSubDto extends PartialType(CreateSubDto) {
  active?: boolean;
  activatedAt?: Date;
  endsAt?: Date;
}
