import { Test, TestingModule } from '@nestjs/testing';
import { VipManagementService } from './vip-management.service';

describe('VipManagementService', () => {
  let service: VipManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VipManagementService],
    }).compile();

    service = module.get<VipManagementService>(VipManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
