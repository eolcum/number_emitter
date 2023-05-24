import { Worker } from 'worker_threads';
import { Observable, Subject } from 'rxjs';
import { Injectable } from '@nestjs/common';

/**
 * Service for generating random numbers and providing them as an Observable.
 */
@Injectable()
export class RandomService {

  private generator: Worker;

  /**
   * Subject for emitting the random numbers.
   */
  private randomNumber: Subject<Number> = new Subject<Number>();

  /**
   * Interval at which the random numbers are generated.
   */
  private interval: Number;
  /**
   * Range of the generated random numbers.
   */
  private range: Number;

  /**
   * @returns Observable of the random numbers.
   */
  public getObservableNumber(): Observable<Number> {
    return this.randomNumber.asObservable();
  }

  /**
   * Start generating random numbers at the specified interval and range.
   * @param interval Interval at which the random numbers are generated.
   * @param range Range of the generated random numbers.
   */
  public start(interval: Number, range: Number): void {
    this.generator = new Worker('./src/number_generator.js', {
      workerData: {
        interval: interval,
        range: range
      }
    });
    this.generator.on('message', (message) => {
      this.randomNumber.next(message);
    });
    this.interval = interval;
    this.range = range;
  }

  /**
   * Stop generating random numbers.
   * @returns Promise resolving to the exit code of the Worker thread.
   * @throws Error if the service is not currently generating random numbers.
   */
  public stop(): Promise<number> {
    if (this.generator)
      return this.generator.terminate()
    else
      return Promise.reject(new Error('Channel not started.'))
  }

  /**
   * Set the interval and range for the random number generator.
   * @param interval The interval between random number generation, in milliseconds.
   * @param range The range of possible random numbers, from 0 to this value.
   */
  public setParam(interval: Number, range: Number): void {
    if (interval == null || range == null || interval <= 0 || range <= 0)
      throw new Error("Invalid Paramaters.");
    this.stop()
    this.start(interval, range)
  }
}