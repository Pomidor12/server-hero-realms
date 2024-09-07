import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { CreatePlayerDto } from '../controllers/dtos/create-Player.dto';

@Injectable()
export class PlayerService {
  private readonly db: PrismaClient;

  public createPlayer(dto: CreatePlayerDto) {
    const player = this.db.player.create({
      data: {
        name: dto.name,
        battlefieldId: dto.battlefieldId,
        image: '',
        health: 50,
        turnOrder: 1,
        currentTurnPlayer: false,
      },
    });

    return player;
  }
}
