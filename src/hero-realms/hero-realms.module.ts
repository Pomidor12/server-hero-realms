import { Module } from '@nestjs/common';

import { HeroModule } from './hero/hero.module';
import { PlayerModule } from './player/player.module';
import { BattlefieldModule } from './battlefield/battlefield.module';

@Module({
  imports: [HeroModule, PlayerModule, BattlefieldModule],
})
export class HeroRealmsModule {}
