import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { input } from '@inquirer/prompts';
import type { ModuleOptions } from './types';

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

  if (options.logIn) {
    client.start({
      phoneNumber: async () => await input({ message: 'Your phone number: ' }),
      phoneCode: async () => await input({ message: 'Enter code: ' }),
      password: async () => await input({ message: 'Password: ' }),
      onError: (error) => {
        throw error;
      },
    });

    const session = client.session.save();
    console.log(`Your session string is: ${session}`);
    console.log(
      'Don`t forget store this and use it next time in module settings.',
    );
  }

  if (options.session || !!client.session.authKey) {
    await client.connect();
  }

  return client;
};

export { createClient };
