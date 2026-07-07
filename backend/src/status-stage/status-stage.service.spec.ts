import { Test, TestingModule } from '@nestjs/testing';
import { StatusStageService } from './status-stage.service';

describe('StatusStageService', () => {
  let service: StatusStageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusStageService],
    }).compile();

    service = module.get<StatusStageService>(StatusStageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
