import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HeroRealmsModule } from './hero-realms/hero-realms.module';

@Module({
  imports: [HeroRealmsModule, DatabaseModule.forRoot()],
})
export class AppModule {}
