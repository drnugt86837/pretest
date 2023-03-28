import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BitstampModule } from "./bitstamp/bitstamp.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { LoggingInterceptor } from "./logging/logging.interceptor";


@Module({
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    }
  ],
  controllers: [AppController],
  imports: [BitstampModule]
})
export class AppModule {
}
