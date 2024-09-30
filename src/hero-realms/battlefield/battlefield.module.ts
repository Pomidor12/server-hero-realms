import { forwardRef, Module } from '@nestjs/common';

import { HeroModule } from '../hero/hero.module';
import { SocketModule } from 'libs/socket/socket.module';
import { BattlefieldController } from './controllers/battlefield.controller';
import { BattlefieldService } from './services/battlefield.service';
import { BattlefieldGateway } from './gateway/battlefield.gateway';

@Module({
  imports: [SocketModule, forwardRef(() => HeroModule)],
  controllers: [BattlefieldController],
  providers: [BattlefieldService, BattlefieldGateway],
  exports: [BattlefieldService],
})
export class BattlefieldModule {}
