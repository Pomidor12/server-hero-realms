import { DynamicModule, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { DatabaseService } from './database.service';

@Module({})
export class DatabaseModule {
  public static async forRoot(): Promise<DynamicModule> {
    try {
      const client = new PrismaClient();

      await client.$connect();

      return {
        global: true,
        module: DatabaseModule,
        providers: [
          {
            provide: PrismaClient,
            useValue: client,
          },
          DatabaseService,
        ],
        exports: [DatabaseService, PrismaClient],
      };
    } catch (error) {
      console.error(error);
    }
  }
}
