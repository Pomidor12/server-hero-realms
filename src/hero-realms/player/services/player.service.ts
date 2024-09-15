import { Injectable } from '@nestjs/common';
import { HeroPlacement, PrismaClient } from '@prisma/client';

import type { CreatePlayerDto } from '../controllers/dtos/create-Player.dto';
import { UpdatePlayerDto } from '../controllers/dtos/update-player.dto';
import { BattlefieldService } from 'src/hero-realms/battlefield/services/battlefield.service';
import { CLIENT_MESSAGES } from 'src/hero-realms/battlefield/battlefield.constant';
import { getRandomNumbers } from 'src/hero-realms/utils/math';

@Injectable()
export class PlayerService {
  constructor(
    private readonly db: PrismaClient,
    private readonly battlefield: BattlefieldService,
  ) {}

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

  public async endPlayerMove(id: number) {
    const updatedPlayer = await this.db.player.update({
      where: { id },
      data: {
        currentTurnPlayer: false,
        currentGoldCount: 0,
      },
      include: {
        battlefield: { include: { players: true } },
        heroes: true,
      },
    });

    for (const hero of updatedPlayer.heroes) {
      if (
        hero.placement === HeroPlacement.ACTIVE_DECK ||
        hero.placement === HeroPlacement.DEFENDERS_ROW
      ) {
        await this.db.hero.update({
          where: { id: hero.id },
          data: { placement: HeroPlacement.RESET_DECK },
        });
      }

      await this.db.action.updateMany({
        where: { heroId: hero.id, isUsed: true },
        data: { isUsed: false },
      });
    }

    const [opponentPlayer] = updatedPlayer.battlefield.players.filter(
      (player) => player.id !== id,
    );

    if (opponentPlayer) {
      await this.db.player.update({
        where: { id: opponentPlayer.id },
        data: {
          currentTurnPlayer: true,
        },
      });
    }

    const selectionPlayerDeck = updatedPlayer.heroes.filter(
      (hero) => hero.placement === HeroPlacement.SELECTION_DECK,
    );

    const newRandomActiveDeck = getRandomNumbers(
      0,
      selectionPlayerDeck.length - 1,
      5,
    );

    for (const [index, hero] of selectionPlayerDeck.entries()) {
      if (newRandomActiveDeck.includes(index)) {
        await this.db.hero.update({
          where: { id: hero.id },
          data: {
            actions: {
              updateMany: {
                where: { heroId: hero.id },
                data: { isUsed: false },
              },
            },
            placement: HeroPlacement.ACTIVE_DECK,
          },
        });
      }
    }

    if (selectionPlayerDeck.length < 5) {
      const resetPlayerDeck = updatedPlayer.heroes.filter(
        (hero) =>
          hero.placement === HeroPlacement.RESET_DECK ||
          hero.placement === HeroPlacement.ACTIVE_DECK,
      );

      const newRandomActiveDeck = getRandomNumbers(
        0,
        resetPlayerDeck.length - 1,
        5 - selectionPlayerDeck.length,
      );

      for (const [index, hero] of resetPlayerDeck.entries()) {
        await this.db.hero.update({
          where: { id: hero.id },
          data: {
            placement: newRandomActiveDeck.includes(index)
              ? HeroPlacement.ACTIVE_DECK
              : HeroPlacement.SELECTION_DECK,
          },
        });
      }
    }

    await this.battlefield.getBattlefieldAndNotifyAllSubs(
      CLIENT_MESSAGES.BATTLEFIELD_UPDATED,
      updatedPlayer.battlefieldId,
    );

    return updatedPlayer;
  }

  public async getPlayers() {
    const players = await this.db.player.findMany({
      include: { heroes: true },
    });

    return players;
  }
}
