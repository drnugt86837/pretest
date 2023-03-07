import { Module } from '@nestjs/common';
import { BitstampGateway } from './bitstamp.gateway';

@Module({
  providers: [BitstampGateway],
})
export class BitstampModule {}
