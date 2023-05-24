import { Test, TestingModule } from '@nestjs/testing';
import { RandomService } from './random.service';
import {EventEmitter} from 'events';


//Mock implementation of worker_thread: Worker class
jest.mock('worker_threads', () => {
  return {
    Worker: jest.fn().mockImplementation(() => {
      const payload = 1;
      const eventEmitter: EventEmitter = new EventEmitter();
       eventEmitter.emit('message',[payload]);
      return {
        on: jest.fn().mockImplementation((message:string, fn) => {
          return fn(payload);
        }),
        terminate: jest.fn().mockImplementation(() => {
          return Promise.resolve(1);
        })
      };
    }),
  };
});

describe('RandomService', () => {
  let randomService: RandomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomService],
    }).compile();

    randomService = module.get<RandomService>(RandomService); 
  });

  it('should be defined', () => {
    expect(randomService).toBeDefined();
  });

  it('should return an observable of random numbers', () => {
    const spy = jest.spyOn(randomService['randomNumber'], 'asObservable');
    randomService.getObservableNumber();
    expect(spy).toHaveBeenCalled();
  });

  it('should start generating random numbers', () => { 
    const spy = jest.spyOn(randomService['randomNumber'], 'next');
    randomService.start(100, 10);
    expect(spy).toHaveBeenCalledWith(1);    
  });

  it('should stop generating random numbers', () => { 
    randomService.start(100, 10);
    randomService.stop().then((code) => {
      expect(code).toBe(1);  
    });
  });

  it('should throw an error if the random generator has not started', () => {
    randomService.stop().catch( (error) => {
      expect(error.message).toBe('Channel not started.')
    });
  });

  it('should stop an existing generator and start a new one with updated parameters', () => { 
    randomService.start(100, 10);
    const newInterval = 100
    const newRange = 40
    const stopSpy = jest.spyOn(randomService, 'stop');
    const startSpy = jest.spyOn(randomService, 'start');
    randomService.setParam(newInterval, newRange);
    expect(stopSpy).toHaveBeenCalled();    
    expect(startSpy).toHaveBeenCalledWith(newInterval, newRange);
  });

  it('should throw Error if the range is less or equals to 0', () => { 
    const newInterval = -1
    const newRange = 0
    expect(() => randomService.setParam(newInterval, newRange)).toThrowError('Invalid Paramaters.');

  });
});
