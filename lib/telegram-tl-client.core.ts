import { TelegramClient } from 'telegram';
import { TelegramClientParams } from 'telegram/client/telegramBaseClient';
import { StringSession } from 'telegram/sessions';

export type ModuleOptions = {
  session?: string;
  apiId: number;
  apiHash: string;
  clientParams: TelegramClientParams;
};

const createClient = async (options: ModuleOptions) => {
  const client = new TelegramClient(
    new StringSession(options.session),
    options.apiId,
    options.apiHash,
    {
      ...options.clientParams,
      autoReconnect: true,
    },
  );

  if (options.session) {
    await client.connect();
  }

  return client;
};

export { createClient };
