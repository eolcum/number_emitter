import { Test, TestingModule } from '@nestjs/testing';
import { NumbersGateway } from '../src/gateway/numbers.gateway';
import { NumbersModule } from '../src/gateway/numbers.module';


describe('WebSocketServer', () => {
  let server: NumbersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NumbersModule],
    }).compile();

    server = module.get<NumbersGateway>(NumbersModule);
  });

  it('should be defined', () => {
    expect(server).toBeDefined();
  });
});
