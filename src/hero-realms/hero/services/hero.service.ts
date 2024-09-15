import { forwardRef, Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import {
  ActionCondition,
  Hero,
  HeroPlacement,
  PrismaClient,
} from '@prisma/client';
import omit from 'lodash.omit';

import { CONVERT_ACTION_CONDITION } from '../enums/action-condition.enum';
import {
  ACTION_TYPE,
  ADDITIONAL_ACTION_INFO,
  DATASET_PATH_FILE,
} from './hero.constant';
import { BattlefieldService } from 'src/hero-realms/battlefield/services/battlefield.service';
import { CONVERT_HERO_PLACEMENT } from '../enums/hero-placement.enum';
import { CLIENT_MESSAGES } from 'src/hero-realms/battlefield/battlefield.constant';
import { getRandomNumber, getRandomNumbers } from 'src/hero-realms/utils/math';

import type {
  ActionWithoutAdditionalInfo,
  Dataset,
  HeroRaw,
  HeroStats,
} from './hero.interface';
import type { HireHeroDto } from '../controllers/dtos/hire-hero.dto';
import type { UseHeroActionsDto } from '../controllers/dtos/use-hero-actions.dto';

@Injectable()
export class HeroService {
  constructor(
    private readonly db: PrismaClient,
    @Inject(forwardRef(() => BattlefieldService))
    private readonly battlefield: BattlefieldService,
  ) {}

  public async getHeroes() {
    const heroes = await this.db.hero.findMany({ include: { actions: true } });

    const normalizedHeroes = heroes.map((hero) => this.normalizeHero(hero));

    return normalizedHeroes;
  }

  public async createHero(hero: HeroStats) {
    const createdHero = await this.db.hero.create({
      data: {
        ...hero,
        placement: CONVERT_HERO_PLACEMENT.TO_BD[hero.placement],
        actions: {
          createMany: {
            data: hero.actions.map((action) => ({
              isOptional: action.isOptional,
              conditions: action.conditions.map(
                (condition) => CONVERT_ACTION_CONDITION.TO_DB[condition],
              ),
              damage: action.damage ?? 0,
              gold: action.gold ?? 0,
              heal: action.heal ?? 0,
              prepareHero: action.prepareHero ?? 0,
              takeCard: action.takeCard ?? 0,
              resetCard: action.resetCard ?? 0,
              resetOpponentsCard: action.resetOpponentsCard ?? 0,
              stanOpponentsHero: action.stanOpponentsHero ?? 0,
              putToDeckResetedCard: action.putToDeckResetedCard ?? 0,
              putToDeckResetedDefender: action.putToDeckResetedDefender ?? 0,
              putPurchasedCardIntoDeck: action.putPurchasedCardIntoDeck ?? 0,
            })),
          },
        },
      },
      include: { actions: true },
    });

    return createdHero;
  }

  public async applyDataset() {
    try {
      const data = await fs.readFile(DATASET_PATH_FILE, 'utf8');
      const { heroes } = JSON.parse(data) as Dataset;

      for (const hero of heroes) {
        const isExist = await this.db.hero.findFirst({
          where: { name: hero.name },
        });

        if (!isExist) {
          await this.createHero(hero);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public async hireHero(dto: HireHeroDto) {
    const player = await this.db.player.findUnique({
      where: { id: dto.playerId },
      include: { heroes: { include: { actions: true } } },
    });

    const hero = await this.db.hero.findUnique({ where: { id: dto.heroId } });

    if (!player || !hero) {
      return;
    }

    if (!player.currentTurnPlayer) {
      return 'Сейчас ход другого игрока';
    }

    if (player.currentGoldCount < hero.price) {
      return 'Недостаточно голды';
    }

    await this.db.hero.update({
      where: { id: dto.heroId },
      data: {
        playerId: dto.playerId,
        placement: dto.putToSelectionDeck
          ? HeroPlacement.SELECTION_DECK
          : HeroPlacement.RESET_DECK,
      },
    });

    const getBattlefieldHeroesCount = await this.db.hero.findMany({
      where: {
        battlefieldId: player.battlefieldId,
        placement: HeroPlacement.TRADING_DECK,
      },
    });
    const newRandomHeroIndex = getRandomNumber(
      0,
      getBattlefieldHeroesCount.length - 1,
    );

    await this.db.hero.update({
      where: { id: getBattlefieldHeroesCount[newRandomHeroIndex].id },
      data: {
        placement: HeroPlacement.TRADING_ROW,
      },
    });

    await this.db.player.update({
      data: {
        currentGoldCount: player.currentGoldCount - hero.price,
      },
      where: {
        id: player.id,
      },
    });

    await this.battlefield.getBattlefieldAndNotifyAllSubs(
      CLIENT_MESSAGES.BATTLEFIELD_UPDATED,
      player.battlefieldId,
    );
  }

  public async useHeroActions(dto: UseHeroActionsDto) {
    const hero = await this.db.hero.findUnique({
      where: { id: dto.heroId },
      include: { actions: true, battlefield: { include: { players: true } } },
    });

    const player = await this.db.player.findUnique({
      where: { id: dto.playerId },
      include: { heroes: true },
    });
    const [opponentPlayer] = hero.battlefield.players.filter(
      ({ id }) => id !== player.id,
    );

    if (!hero || !player || !opponentPlayer) {
      return;
    }

    if (hero.protection) {
      await this.db.hero.update({
        where: { id: hero.id },
        data: { placement: HeroPlacement.DEFENDERS_ROW },
      });
    }

    for (const action of hero.actions) {
      if (action.isUsed) {
        continue;
      }

      const isFractionConditionScs =
        action.conditions.includes(ActionCondition.FRACTION) &&
        !player.heroes.some(
          ({ id, fraction }) => id !== hero.id && fraction === hero.fraction,
        );

      const isSacrificeConditionScs =
        action.conditions.includes(ActionCondition.SACRIFICE) &&
        dto.heroIdForAction;

      if (isFractionConditionScs || isSacrificeConditionScs) {
        continue;
      }

      const actionTypes = omit(
        action,
        ADDITIONAL_ACTION_INFO,
      ) as ActionWithoutAdditionalInfo;

      for (const [actionName, actionValue] of Object.entries(actionTypes)) {
        switch (actionName) {
          case ACTION_TYPE.DAMAGE: {
            await this.db.player.update({
              where: { id: opponentPlayer.id },
              data: {
                health: opponentPlayer.health - actionValue,
              },
            });
            break;
          }

          case ACTION_TYPE.GOLD: {
            await this.db.player.update({
              where: { id: player.id },
              data: {
                currentGoldCount: player.currentGoldCount + actionValue,
              },
            });
            break;
          }

          case ACTION_TYPE.HEAL: {
            await this.db.player.update({
              where: { id: player.id },
              data: {
                health: player.health + actionValue,
              },
            });
            break;
          }

          case ACTION_TYPE.TAKE_CARD: {
            const playerSelectionDeck = player.heroes.filter(
              (hero) => hero.placement === HeroPlacement.SELECTION_DECK,
            );
            const randomCards = getRandomNumbers(
              0,
              playerSelectionDeck.length - 1,
              actionValue,
            );

            for (const [index, hero] of playerSelectionDeck.entries()) {
              if (randomCards.includes(index)) {
                await this.db.hero.updateMany({
                  where: { id: hero.id },
                  data: { placement: HeroPlacement.ACTIVE_DECK },
                });
              }
            }
          }

          case ACTION_TYPE.RESET_CARD: {
            if (!dto.heroIdForAction) {
              continue;
            }
          }

          default: {
            continue;
          }
        }
      }

      await this.db.action.update({
        where: { id: action.id },
        data: { isUsed: true },
      });
    }

    await this.battlefield.getBattlefieldAndNotifyAllSubs(
      CLIENT_MESSAGES.BATTLEFIELD_UPDATED,
      player.battlefieldId,
    );
  }

  public normalizeHero(hero: HeroRaw) {
    return {
      ...hero,
      placement: CONVERT_HERO_PLACEMENT.FROM_BD[hero.placement],
      actions: hero.actions.map((action) => ({
        ...action,
        conditions: action.conditions.map(
          (condition) => CONVERT_ACTION_CONDITION.FROM_DB[condition],
        ),
      })),
    };
  }
}
