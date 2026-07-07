import { Test, TestingModule } from '@nestjs/testing';
import { ProjectStatusController } from './project_status.controller';

describe('ProjectStatusController', () => {
  let controller: ProjectStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectStatusController],
    }).compile();

    controller = module.get<ProjectStatusController>(ProjectStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
