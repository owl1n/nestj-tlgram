import { Provider } from '@nestjs/common';
import { createClient, ModuleOptions } from './telegram-tl-client.core';
import { TELEGRAM_TL_CLIENT_TOKEN } from './telegram-tl-client.constants';

export function createTelegramClientProvider(options: ModuleOptions): Provider {
  return {
    provide: TELEGRAM_TL_CLIENT_TOKEN,
    useFactory: async () => await createClient(options),
  };
}
