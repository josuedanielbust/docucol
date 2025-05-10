import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { RABBIT_SUBSCRIBER_METADATA, RABBIT_PROVIDER } from './constants';
import { ClientProxy, MessagePattern, Payload, Transport, RmqContext } from '@nestjs/microservices';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class MessagingExplorer implements OnModuleInit {
  private readonly logger = new Logger(MessagingExplorer.name);
  private client!: ClientProxy;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    try {
      this.client = this.moduleRef.get(RABBIT_PROVIDER, { strict: false });
      await this.client.connect();
      this.explore();
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ connection', error);
    }
  }

  explore() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    
    [...providers, ...controllers]
      .filter(wrapper => wrapper.instance && wrapper.metatype)
      .forEach(wrapper => this.exploreInstance(wrapper));
      
    this.logger.log('RabbitMQ subscribers exploration completed');
  }

  private exploreInstance(wrapper: InstanceWrapper) {
    const { instance } = wrapper;
    const prototype = Object.getPrototypeOf(instance);
    
    // Replace deprecated scanFromPrototype with getMethodMetadata
    const methods = Object.getOwnPropertyNames(prototype)
      .filter(prop => {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
        return descriptor?.value instanceof Function && prop !== 'constructor';
      });
    
    for (const methodName of methods) {
      this.exploreMethodMetadata(instance, methodName);
    }
  }

  /**
   * This function is mainly for backward compatibility and service discovery
   * In new code, prefer using @MessagePattern directly in controllers
   */
  private exploreMethodMetadata(instance: any, methodName: string) {
    const targetCallback = instance[methodName];
    const metadata = this.reflector.get(
      RABBIT_SUBSCRIBER_METADATA,
      targetCallback,
    );

    if (metadata) {
      this.logger.log(`Found RabbitMQ subscriber for pattern: ${metadata.pattern}`);
      
      // Using built-in decorators would be preferred:
      // @MessagePattern('pattern', Transport.RMQ)
      // handleMessage(@Payload() data: any, @Ctx() context: RmqContext) {}
    }
  }
}
