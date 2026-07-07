import { Test, TestingModule } from '@nestjs/testing';
import { ApprovedProjectController } from './approved-project.controller';

describe('ApprovedProjectController', () => {
  let controller: ApprovedProjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApprovedProjectController],
    }).compile();

    controller = module.get<ApprovedProjectController>(ApprovedProjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
