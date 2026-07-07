import { Test, TestingModule } from '@nestjs/testing';
import { StatusStageController } from './status-stage.controller';

describe('StatusStageController', () => {
  let controller: StatusStageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusStageController],
    }).compile();

    controller = module.get<StatusStageController>(StatusStageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
