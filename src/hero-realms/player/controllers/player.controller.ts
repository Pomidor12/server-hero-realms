import { Body, Controller, Injectable, Post } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { CreatePlayerDto } from './dtos/create-Player.dto';
import { PlayerService } from '../services/player.service';

@Controller({ path: 'player', version: '1' })
export class PlayerController {
  constructor(private readonly player: PlayerService) {}

  @Post()
  public createBattlefield(@Body() dto: CreatePlayerDto) {
    return this.player.createPlayer(dto);
  }
}
