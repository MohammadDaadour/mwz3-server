import { PartialType, OmitType } from '@nestjs/mapped-types';
import { Area } from 'src/areas/entities/area.entity';
import { Category } from 'src/categories/entities/category.entity';
import { State } from 'src/state/entities/state.entity';
import { User } from 'src/users/entities/user.entity';
 
export class AdDto {
  readonly id?: number;
  label?: string;
  value?: number;
  currency?: string;
  description?: string;
  image?: number;
  details?: string;
  boosted?: boolean;
  //new
  boost_request?: boolean;
  //new
  notes?: string;
  visits?: number;
  readonly searchVector?: string;
  activatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  user?: User;
  userFK: number;
  category?: Category;
  categoryFK: number;
  area?: Area;
  areaFK: number;
  state?: State;
  stateFK: number;
}

export class CreateAdDto extends OmitType(AdDto, [
  'id',
  'searchVector',
  'activatedAt',
  'createdAt',
  'updatedAt',
  'deletedAt',
]) {
  label: string;
  value: number;
  currency: string;
  description: string;
  image?: number;
  details: string;
  boosted?: boolean;
  //new
  boost_request?: boolean;
  //new
  notes?: string;
   
  user?: User;
  userFK: number;
  category?: Category;
  categoryFK: number;
  area?: Area;
  areaFK: number;
  state?: State;
  stateFK: number;
}

export class UpdateAdDto extends PartialType(CreateAdDto) {
  visits?: number;
  activatedAt?: Date;
}


