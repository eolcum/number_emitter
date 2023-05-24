
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { AppModule } from './../app.module';
import { NumbersGateway } from './numbers.gateway';

describe('NumbersGateway', () => {
  let numbersGateway: NumbersGateway;
  let server: jest.Mocked<Server>;

  beforeEach(async () => {
    server = {
      emit: jest.fn(),
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    numbersGateway = module.get<NumbersGateway>(NumbersGateway);
    numbersGateway.server = server;
  });

  describe('onEvent', () => {
    it('should call onStart if action is "start"', () => {
      const spy = jest.spyOn(numbersGateway, 'onStart');
      numbersGateway.onEvent({ action: 'start', channelId: 1, data: {} });
      expect(spy).toHaveBeenCalledWith(1, {});
    });

    it('should call onStop if action is "stop"', () => {
      const spy = jest.spyOn(numbersGateway, 'onStop');
      numbersGateway.onEvent({ action: 'stop', channelId: 1, data: {} });
      expect(spy).toHaveBeenCalledWith(1);
    });

    it('should call onSetParam if action is "setParam"', () => {
      const spy = jest.spyOn(numbersGateway, 'onSetParam');
      numbersGateway.onEvent({ action: 'setParam', channelId: 1, data: {} });
      expect(spy).toHaveBeenCalledWith(1, {});
    });
  });

  describe('onStart', () => {
    it('should emit an error if the channelId is invalid', () => {
      numbersGateway.onStart(3, {});
      expect(server.emit).toHaveBeenCalledWith('events', {
        event: 'Error',
        data: { error: 'Invalid channelId.', channelId: 3 },
      });
    });

    it('should emit an error if the channel is already started', () => {
      numbersGateway.onStart(1, {interval: 1000, range: 10 });
      numbersGateway.onStart(1, {interval: 10, range: 20 });
      expect(server.emit).toHaveBeenCalledWith('events', {
        event: 'Error',
        data: { error: 'Channel already started.', channelId: 1 },
      });
    });

    it('should start the random service and subscribe to its observable', () => {
      const spy = jest.spyOn(numbersGateway['randomServiceSupscriptions'], 'set');
      numbersGateway.onStart(1, { interval: 100, range: 10 });
      expect(spy).toHaveBeenCalledWith(1, expect.anything());
    });
  });
});
