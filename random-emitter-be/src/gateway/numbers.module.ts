import { Module } from '@nestjs/common';
import { NumbersGateway } from './numbers.gateway';

/**
 * Module for the `NumbersGateway` WebSocket gateway.
 */
@Module({
    providers: [NumbersGateway] 
})
export class NumbersModule {}
