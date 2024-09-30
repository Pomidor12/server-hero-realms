import { Module } from '@nestjs/common';

import { PlayerController } from './player/controllers/player.controller';
import { BattlefieldController } from './battlefield/controllers/battlefield.controller';
import { HeroController } from './hero/controllers/hero.controller';
import { PlayerService } from './player/services/player.service';
import { BattlefieldService } from './battlefield/services/battlefield.service';
import { HeroService } from './hero/services/hero.service';
import { BattlefieldGateway } from './battlefield/gateway/battlefield.gateway';
import { SocketModule } from 'libs/socket/socket.module';

@Module({
  imports: [SocketModule],
  controllers: [PlayerController, BattlefieldController, HeroController],
  providers: [
    PlayerService,
    BattlefieldService,
    HeroService,
    BattlefieldGateway,
  ],
})
export class HeroRealmsModule {}
