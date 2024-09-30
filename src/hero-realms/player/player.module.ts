import { Module } from '@nestjs/common';

import { HeroModule } from '../hero/hero.module';
import { PlayerService } from './services/player.service';
import { SocketModule } from 'libs/socket/socket.module';
import { PlayerController } from './controllers/player.controller';
import { BattlefieldModule } from '../battlefield/battlefield.module';

@Module({
  imports: [SocketModule, HeroModule, BattlefieldModule],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
