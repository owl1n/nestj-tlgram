import { DynamicModule, Module } from '@nestjs/common';
import { ModuleOptions } from './telegram-tl-client.core';
import {
  TelegramClientAsyncOptions,
  TelegramClientCoreModule,
} from './telegram-tl-client.core-module';
import { TelegramClientEventsAccessorModule } from './telegram-tl-client-events.module';

@Module({})
export class TelegramClientModule {
  public static forRoot(options: ModuleOptions): DynamicModule {
    return {
      module: TelegramClientModule,
      imports: [
        TelegramClientCoreModule.forRoot(options),
        TelegramClientEventsAccessorModule,
      ],
    };
  }

  public static forRootAsync(
    options: TelegramClientAsyncOptions,
  ): DynamicModule {
    return {
      module: TelegramClientModule,
      imports: [
        TelegramClientCoreModule.forRootAsync(options),
        TelegramClientEventsAccessorModule,
      ],
    };
  }
}
