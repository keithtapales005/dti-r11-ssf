import { Test, TestingModule } from '@nestjs/testing';
import { StatusTypeService } from './status-type.service';

describe('StatusTypeService', () => {
  let service: StatusTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusTypeService],
    }).compile();

    service = module.get<StatusTypeService>(StatusTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
