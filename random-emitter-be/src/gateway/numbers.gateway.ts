import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { RandomService } from './../random/random.service';
import EventPackage from './eventPackage.interface';

/**
 * A class that uses the `@WebSocketGateway` decorator from `@nestjs/websockets` to define a WebSocket Gateway in a NestJS application.
 * A WebSocket Gateway allows you to handle WebSocket connections and events in a NestJS application. It can also be used to broadcast events to connected clients.
 * This class has the following properties:
 *
 * - `server`: This property is decorated with `@WebSocketServer()`, which indicates that it should be injected with the Socket.io server instance. It will be used to emit events to connected clients.
 *
 * - `randomServices`: This is a `Map` object that stores `RandomService` instances, with the keys being a `Number`.
 *
 * - `randomServiceSupscriptions`: This is a `Map` object that stores RxJS `Subscription` objects, with the keys being a `Number`.
 *
 * The class has the following methods:
 *
 * - `onEvent(event: EventPackage)`: This method is decorated with `@SubscribeMessage('events')`, which indicates that it should be invoked whenever a client sends a message with the event name `'events'`. The `@MessageBody()` decorator is used to extract the message body (in this case, an `EventPackage` object) from the incoming message. The method then determines the action specified in the `EventPackage` object and invokes the appropriate method (`onStart`, `onStop`, or `onSetParam`).
 *
 * - `onStart(id: Number, data: any)`: This method is called when the `'start'` action is specified in the `EventPackage` object. It starts the `RandomService` instance for the specified `channelId` (`id`), and sets up an RxJS `Subscription` that listens for random numbers from the `RandomService` and broadcasts them to connected clients using the `server.emit` method.
 *
 * - `onStop(id: Number)`: This method is called when the `'stop'` action is specified in the `EventPackage` object. It stops the `RandomService` instance for the specified `channelId` (`id`) and removes the corresponding `Subscription` from the `randomServiceSupscriptions` map.
 *
 * - `onSetParam(id: Number, data: any)`: This method is called when the `'setParam'` action is specified in the `EventPackage` object. It updates the parameters (`interval` and `range`) for the `RandomService` instance with the specified `channelId` (`id`).
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NumbersGateway {

  private randomServices: Map<Number, RandomService>;
  private randomServiceSupscriptions: Map<Number | undefined, Subscription | undefined>;

  @WebSocketServer()
  server: Server;

  constructor() {
    this.randomServices = new Map();
    this.randomServiceSupscriptions = new Map();
    this.randomServices.set(1, new RandomService());
    this.randomServices.set(2, new RandomService());
  }


  /**
   * Handles incoming messages with the event name `'events'`.
   *
   * @param event - An `EventPackage` object containing information about the action to be taken and any relevant data.
   *
   * This method determines the action specified in the `EventPackage` object and invokes the appropriate method (`onStart`, `onStop`, or `onSetParam`).
   */
  @SubscribeMessage('events')
  onEvent(@MessageBody() event: EventPackage): void {
    if ('start' == event.action)
      this.onStart(event.channelId, event.data);
    else if ('stop' == event.action)
      this.onStop(event.channelId);
    else if ('setParam' == event.action)
      this.onSetParam(event.channelId, event.data);
  }

  /**
   * Starts the `RandomService` instance for the specified `channelId` (`id`), and sets up an RxJS `Subscription` that listens for random numbers from the `RandomService` and broadcasts them to connected clients using the `server.emit` method.
   *
   * @param id - The `channelId` for which the `RandomService` instance should be started.
   * @param data - An object containing the `interval` and `range` parameters for the `RandomService`.
   */
  onStart(id: Number, data: any): void {
    if (id != 1 && id != 2) {
      this.server.emit("events", ({ event: "Error", data: { "error": "Invalid channelId.", "channelId": id } }))
    } else if (this.randomServiceSupscriptions.has(id)) {
      this.server.emit("events", ({ event: "Error", data: { "error": "Channel already started.", "channelId": id } }))
    } else {

      let randomService = this.randomServices.get(id);
      let observableRandomNumber = randomService?.getObservableNumber();
      let subscription = observableRandomNumber?.pipe(
        map(r => {
          this.server.emit("numbers", ({ channelNo: id, value: r }))
        }
        )
      ).subscribe();

      this.randomServiceSupscriptions.set(id, subscription);
      randomService?.start(data.interval, data.range);
    }
  }

  /**
   * Stops the `RandomService` instance for the specified `channelId` (`id`) and removes the RxJS `Subscription` that was listening for random numbers from the `RandomService`.
   *
   * @param id - The `channelId` for which the `RandomService` instance should be stopped.
   */
  onStop(id: Number): void {
    if (id == null) return;
    this.randomServiceSupscriptions.get(id)?.unsubscribe();

    this.randomServiceSupscriptions.delete(id);
    this.randomServices.get(id)?.stop()
      .then(() => {
        this.server.emit("events", ({ event: "Channel stopped.", data: id }))
      }).catch((e) => {
        this.server.emit("events", ({ event: "Error", data: { "error": e.message, "channelId": id } }))
      });
  }
  /**
   * Sets the `interval` and `range` parameters for the `RandomService` instance associated with the specified `channelId` (`id`).
   *
   * @param id - The `channelId` for which the `RandomService` instance's parameters should be set.
   * @param data - An object containing the `interval` and `range` parameters for the `RandomService`. Interval is the interval the numbers will be generated. Range is the max possible value of random numbers.
   */
  onSetParam(id: Number, data: any): void {
    if (!this.randomServiceSupscriptions.has(id)) {
      this.server.emit("events", ({ event: "Error", data: { "error": "Channel not started yet.", "channelId": id } }))
    } else {
      this.randomServices.get(id)?.setParam(data.interval, data.range);
    }
  }
}