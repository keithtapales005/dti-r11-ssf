import { Test, TestingModule } from '@nestjs/testing';
import { StatusTypeController } from './status-type.controller';

describe('StatusTypeController', () => {
  let controller: StatusTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusTypeController],
    }).compile();

    controller = module.get<StatusTypeController>(StatusTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
