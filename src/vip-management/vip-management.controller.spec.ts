import { Test, TestingModule } from '@nestjs/testing';
import { VipManagementController } from './vip-management.controller';
import { VipManagementService } from './vip-management.service';

describe('VipManagementController', () => {
  let controller: VipManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VipManagementController],
      providers: [VipManagementService],
    }).compile();

    controller = module.get<VipManagementController>(VipManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
