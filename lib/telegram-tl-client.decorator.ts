import {
  TELEGRAM_TL_CLIENT_EVENT_LISTENER_METADATA,
  TELEGRAM_TL_CLIENT_TOKEN,
} from './telegram-tl-client.constants';
import { Inject } from '@nestjs/common';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';
import { NewMessage } from 'telegram/events';
import { Album } from 'telegram/events/Album';
import { CallbackQuery } from 'telegram/events/CallbackQuery';
import { DeletedMessage } from 'telegram/events/DeletedMessage';

export type TelegramEvent = NewMessage | Album | CallbackQuery | DeletedMessage;

export function InjectTelegramClient() {
  return Inject(TELEGRAM_TL_CLIENT_TOKEN);
}

export function OnTelegramClientEvent(event: TelegramEvent): MethodDecorator {
  const decoratorFactory = (target: any, key?: any, descriptor?: any) => {
    extendArrayMetadata(
      TELEGRAM_TL_CLIENT_EVENT_LISTENER_METADATA,
      [{ event }],
      descriptor.value,
    );
    return descriptor;
  };
  decoratorFactory.KEY = TELEGRAM_TL_CLIENT_EVENT_LISTENER_METADATA;
  return decoratorFactory;
}
