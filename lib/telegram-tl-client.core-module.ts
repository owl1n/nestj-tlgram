import { createClient, ModuleOptions } from './telegram-tl-client.core';
import { InjectTelegramClient } from './telegram-tl-client.decorator';
import { createTelegramClientProvider } from './telegram-tl-client.provider';
import {
  TELEGRAM_TL_CLIENT_MODULE_OPTIONS,
  TELEGRAM_TL_CLIENT_TOKEN,
} from './telegram-tl-client.constants';
import { TelegramClient } from 'telegram';
import {
  DynamicModule,
  Global,
  Module,
  ModuleMetadata,
  Provider,
  Type,
} from '@nestjs/common';

export interface TelegramClientOptionsFactory {
  createTelegramClientOptions(): Promise<ModuleOptions> | ModuleOptions;
}

export interface TelegramClientAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<TelegramClientOptionsFactory>;
  useExisting?: Type<TelegramClientOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
}

@Global()
@Module({})
export class TelegramClientCoreModule {
  constructor(
    @InjectTelegramClient()
    protected readonly telegramClient: TelegramClient,
  ) {}

  public static forRoot(options: ModuleOptions): DynamicModule {
    const provider = createTelegramClientProvider(options);

    return {
      exports: [provider],
      module: TelegramClientCoreModule,
      providers: [provider],
    };
  }

  public static forRootAsync(
    options: TelegramClientAsyncOptions,
  ): DynamicModule {
    const provider: Provider = {
      inject: [TELEGRAM_TL_CLIENT_MODULE_OPTIONS],
      provide: TELEGRAM_TL_CLIENT_TOKEN,
      useFactory: (options: ModuleOptions) => createClient(options),
    };

    return {
      exports: [provider],
      imports: options.imports,
      module: TelegramClientCoreModule,
      providers: [...this.createAsyncProvider(options), provider],
    };
  }

  public static createAsyncProvider(
    options: TelegramClientAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<TelegramClientOptionsFactory>;

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: TelegramClientAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: TELEGRAM_TL_CLIENT_MODULE_OPTIONS,
        useFactory: options.useFactory,
      };
    }

    const inject = [
      (options.useClass ||
        options.useExisting) as Type<TelegramClientOptionsFactory>,
    ];

    return {
      provide: TELEGRAM_TL_CLIENT_MODULE_OPTIONS,
      useFactory: async (optionsFactory: TelegramClientOptionsFactory) =>
        await optionsFactory.createTelegramClientOptions(),
      inject,
    };
  }
}
