import { Injectable } from '@nestjs/common';
import { HeroPlacement, PrismaClient } from '@prisma/client';

import { BattlefieldService } from 'src/hero-realms/battlefield/services/battlefield.service';
import { CLIENT_MESSAGES } from 'src/hero-realms/battlefield/battlefield.constant';
import { getRandomNumbers } from 'src/hero-realms/utils/math';
import { HeroService } from 'src/hero-realms/hero/services/hero.service';

import type { CreatePlayerDto } from '../controllers/dtos/create-Player.dto';
import type { UpdatePlayerDto } from '../controllers/dtos/update-player.dto';
import type { AttackPlayerDto } from '../controllers/dtos/attack-player.dto';

@Injectable()
export class PlayerService {
  constructor(
    private readonly db: PrismaClient,
    private readonly battlefield: BattlefieldService,
    private readonly hero: HeroService,
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
      include: { heroes: { include: { actions: true } } },
    });

    const heroes = player.heroes.map((hero) => this.hero.normalizeHero(hero));

    return { ...player, heroes };
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

  public async getPlayer(id: number) {
    const player = await this.db.player.findUnique({
      where: {
        id,
      },
      include: {
        heroes: { include: { actions: true } },
      },
    });

    const heroes = player.heroes.map((hero) => this.hero.normalizeHero(hero));

    return { ...player, heroes };
  }

  public async getPlayers() {
    const players = await this.db.player.findMany({
      include: { heroes: true },
    });

    return players;
  }

  public async endPlayerMove(id: number) {
    const updatedPlayer = await this.db.player.update({
      where: { id },
      data: {
        currentTurnPlayer: false,
        currentGoldCount: 0,
        currentDamageCount: 0,
      },
      include: {
        battlefield: { include: { players: true } },
        heroes: true,
      },
    });

    for (const hero of updatedPlayer.heroes) {
      if (hero.placement === HeroPlacement.ACTIVE_DECK) {
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
      5 - updatedPlayer.guaranteedHeroes.length,
    );

    for (const [index, hero] of selectionPlayerDeck.entries()) {
      if (
        newRandomActiveDeck.includes(index) ||
        updatedPlayer.guaranteedHeroes.includes(index)
      ) {
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

  public async attackPlayer(dto: AttackPlayerDto) {
    const attacker = await this.db.player.findUnique({
      where: { id: dto.attackingPlayerId },
    });

    const defendingPlayer = await this.db.player.findUnique({
      where: { id: dto.defendingPlayerId },
      include: { heroes: true },
    });

    if (!attacker || !defendingPlayer) {
      return 'игрок не найден';
    }

    const isDefendingPlayerHaveGuardian = defendingPlayer.heroes.some(
      (hero) =>
        hero.isGuardian && hero.placement === HeroPlacement.DEFENDERS_ROW,
    );

    if (dto.heroIdToAttack) {
      const heroToAttack = defendingPlayer.heroes.find(
        (hero) => hero.id === dto.heroIdToAttack,
      );
      const isEnoughDamage =
        heroToAttack.protection <= attacker.currentDamageCount;

      if (!isEnoughDamage) {
        return 'недостаточно урона';
      }

      if (
        heroToAttack &&
        heroToAttack.placement === HeroPlacement.DEFENDERS_ROW
      ) {
        if (heroToAttack.isGuardian || !isDefendingPlayerHaveGuardian) {
          await this.db.hero.update({
            where: { id: dto.heroIdToAttack },
            data: {
              placement: HeroPlacement.RESET_DECK,
              actions: {
                updateMany: {
                  where: { heroId: dto.heroIdToAttack },
                  data: { isUsed: false },
                },
              },
            },
          });

          await this.db.player.update({
            data: {
              currentDamageCount:
                attacker.currentDamageCount - heroToAttack.protection,
            },
            where: { id: dto.attackingPlayerId },
          });
        } else {
          return 'необходимо атаковать стража';
        }
      }
    } else {
      if (isDefendingPlayerHaveGuardian) {
        return 'необходимо атаковать стража';
      }

      const updatedDefendingPlayer = await this.db.player.update({
        data: { health: defendingPlayer.health - attacker.currentDamageCount },
        where: { id: dto.defendingPlayerId },
      });

      if (updatedDefendingPlayer.health > attacker.currentDamageCount) {
        await this.db.player.update({
          data: { currentDamageCount: 0 },
          where: { id: dto.attackingPlayerId },
        });
      }
    }

    await this.battlefield.getBattlefieldAndNotifyAllSubs(
      CLIENT_MESSAGES.BATTLEFIELD_UPDATED,
      attacker.battlefieldId,
    );
  }
}
