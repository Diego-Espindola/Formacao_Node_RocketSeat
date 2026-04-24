import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/prisma/client.js';
import { createPrismaPgAdapter } from '@/prisma/create-prisma-pg-adapter';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    super({
      adapter: createPrismaPgAdapter(url),
      log: ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
