import { Module } from '@nestjs/common';
import { NumbersModule } from './gateway/numbers.module';

@Module({
  imports: [NumbersModule],
})
export class AppModule {}
