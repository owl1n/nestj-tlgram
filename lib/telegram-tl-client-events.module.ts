import { InjectTelegramClient, TelegramEvent } from './telegram-tl-client.decorator';
import { TELEGRAM_TL_CLIENT_EVENT_LISTENER_METADATA } from './telegram-tl-client.constants';
import { Module, OnModuleInit } from '@nestjs/common';
import { Api, TelegramClient } from 'telegram';
import { Module as ModuleType } from '@nestjs/core/injector/module';
import {
  ContextIdFactory,
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  Reflector,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { NewMessage, NewMessageEvent } from 'telegram/events';
import { EventCommon } from 'telegram/events/common';

@Module({
  providers: [DiscoveryService, MetadataScanner],
})
export class TelegramClientEventsAccessorModule implements OnModuleInit {
  private readonly injector = new Injector();

  constructor(
    @InjectTelegramClient()
    protected readonly client: TelegramClient,
    protected readonly reflector: Reflector,
    protected readonly discoveryService: DiscoveryService,
    protected readonly metadataScanner: MetadataScanner,
    protected readonly moduleRef: ModuleRef,
  ) { }

  async onModuleInit() {
    const providers = [...this.discoveryService.getProviders()].filter(
      (_) => _.instance && !_.isAlias,
    );
    for (const wrapper of providers) {
      const { instance } = wrapper;
      const prototype = Object.getPrototypeOf(instance) || {};
      const methods = this.metadataScanner.getAllMethodNames(prototype);
      const isRequestScoped = !wrapper.isDependencyTreeStatic();
      for (const method of methods) {
        await this.subscribeIfListener(
          instance,
          method,
          isRequestScoped,
          wrapper.host as ModuleType,
        );
      }
    }
  }

  async subscribeIfListener(
    instance: Record<string, any>,
    methodKey: string,
    isRequestedScope: boolean,
    moduleRef: ModuleType,
  ): Promise<void> {
    const metadatas = this.reflector.get<{ event: TelegramEvent }[]>(
      TELEGRAM_TL_CLIENT_EVENT_LISTENER_METADATA,
      instance[methodKey],
    );
    if (!metadatas) return;

    const obj = metadatas[0];
    if (!obj.event) return;

    if (isRequestedScope) {
      this.registerScoped({
        listenerMethodKey: methodKey,
        moduleRef,
        instance,
        listenEvent: obj.event,
      });
    } else {
      const cb = (event: EventCommon) => {
        instance[methodKey].call(instance, event);
      };
      this.client.removeEventHandler(cb, obj.event);
      this.client.addEventHandler(cb, obj.event);
      if (this.client.connected) {
        await this.client.getMe();
      }
    }
  }

  private registerScoped(context: {
    listenerMethodKey: string;
    moduleRef: ModuleType;
    instance: Record<string, any>;
    listenEvent: any;
  }) {
    const { listenerMethodKey, moduleRef, instance } = context;
    const cb = async (event: NewMessageEvent) => {
      const contextId = ContextIdFactory.create();
      this.moduleRef.registerRequestByContextId(event, contextId);

      const contextInstance = await this.injector.loadPerContext(
        instance,
        moduleRef,
        moduleRef.providers,
        contextId,
      );

      return contextInstance[listenerMethodKey].call(contextInstance, event);
    };

    this.client.removeEventHandler(cb, context.listenEvent);
    this.client.addEventHandler(cb, context.listenEvent);
  }
}
