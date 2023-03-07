import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BitstampModule } from './bitstamp/bitstamp.module';

@Module({
  providers: [AppService],
  controllers: [AppController],
  imports: [BitstampModule],
})
export class AppModule {}
