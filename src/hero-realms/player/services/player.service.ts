import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { CreatePlayerDto } from '../controllers/dtos/create-Player.dto';
import { UpdatePlayerDto } from '../controllers/dtos/update-player.dto';

@Injectable()
export class PlayerService {
  constructor(private readonly db: PrismaClient) {}

  public async createPlayer(dto: CreatePlayerDto) {
    const player = await this.db.player.create({
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

  public async updatePlayer(dto: UpdatePlayerDto) {
    const updatedPlayer = await this.db.player.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        battlefieldId: dto.battlefieldId,
        image: dto.image,
        health: dto.health,
        turnOrder: dto.turnOrder,
        currentTurnPlayer: dto.currentTurnPlayer,
      },
    });

    return updatedPlayer;
  }

  public async getPlayers() {
    const players = await this.db.player.findMany({
      include: { heroes: true },
    });

    return players;
  }
}
