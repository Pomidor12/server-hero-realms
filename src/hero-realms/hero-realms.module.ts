import { Module } from '@nestjs/common';

import { PlayerController } from './player/controllers/player.controller';
import { BattlefieldController } from './battlefield/controllers/battlefield.controller';
import { HeroController } from './hero/controllers/hero.controller';
import { PlayerService } from './player/services/player.service';
import { BattlefieldService } from './battlefield/services/battlefield.service';
import { HeoService } from './hero/services/hero.service';

@Module({
  imports: [],
  controllers: [PlayerController, BattlefieldController, HeroController],
  providers: [PlayerService, BattlefieldService, HeoService],
})
export class HeroRealmsModule {}
