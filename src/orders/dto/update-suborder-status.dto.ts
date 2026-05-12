import { IsEnum, IsNotEmpty } from 'class-validator';
import { subOrderStatus } from '../entities/sub-order.entity';

export class UpdateSubOrderStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(subOrderStatus, { message: 'Invalid status value' })
  status: subOrderStatus;
}