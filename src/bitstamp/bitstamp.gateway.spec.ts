import { Test, TestingModule } from '@nestjs/testing';
import { BitstampGateway } from './bitstamp.gateway';

describe('BitstampGateway', () => {
  let gateway: BitstampGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitstampGateway],
    }).compile();

    gateway = module.get<BitstampGateway>(BitstampGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
