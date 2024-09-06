import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(private client: PrismaClient) {}

  public async onApplicationShutdown() {
    await this.client.$disconnect();
  }
}