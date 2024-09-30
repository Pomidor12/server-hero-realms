import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { HeroRealmsModule } from './hero-realms/hero-realms.module';
import { SocketModule } from 'libs/socket/socket.module';

@Module({
  imports: [HeroRealmsModule, DatabaseModule.forRoot(), SocketModule],
})
export class AppModule {}
