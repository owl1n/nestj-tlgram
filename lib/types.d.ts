import type { TelegramClientParams } from 'telegram/client/telegramBaseClient';

export type ModuleOptions = {
  session?: string;
  logIn?: boolean;
  apiId: number;
  apiHash: string;
  clientParams: TelegramClientParams;
};
