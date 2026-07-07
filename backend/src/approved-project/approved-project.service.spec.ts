import { Test, TestingModule } from '@nestjs/testing';
import { ApprovedProjectService } from './approved-project.service';

describe('ApprovedProjectService', () => {
  let service: ApprovedProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApprovedProjectService],
    }).compile();

    service = module.get<ApprovedProjectService>(ApprovedProjectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
