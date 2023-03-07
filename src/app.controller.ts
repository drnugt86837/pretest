import {
  Controller,
  Get,
  HttpException,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RateLimitingGuard } from './rate-limiting/rate-limiting.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/data')
  @UseGuards(RateLimitingGuard)
  getData(@Query('userId') userId: string) {
    try {
      return this.appService.getData();
    } catch (error) {
      throw new HttpException('Internal Server Error', 500);
    }
  }
}
