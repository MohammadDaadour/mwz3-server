import { PartialType } from '@nestjs/swagger';
import { CreateVipManagementDto } from './create-vip-management.dto';

export class UpdateVipManagementDto extends PartialType(CreateVipManagementDto) {}
