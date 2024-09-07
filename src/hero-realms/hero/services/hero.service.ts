import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import { PrismaClient } from '@prisma/client';

import { CONVERT_ACTION_CONDITION } from '../enums/hero.enum';
import { DATASET_PATH_FILE } from './hero.constant';

import type { Dataset } from './hero.interface';

@Injectable()
export class HeoService {
  constructor(private readonly db: PrismaClient) {}

  public async getHeroes() {
    const heroes = await this.db.hero.findMany({ include: { actions: true } });

    const normalizedHeroes = heroes.map((hero) => ({
      ...hero,
      actions: hero.actions.map((action) => ({
        ...action,
        conditions: action.conditions.map(
          (condition) => CONVERT_ACTION_CONDITION.FROM_DB[condition],
        ),
      })),
    }));

    return normalizedHeroes;
  }

  public async applyDataset() {
    try {
      const data = await fs.readFile(DATASET_PATH_FILE, 'utf8');
      const { heroes } = JSON.parse(data) as Dataset;

      for (const hero of heroes) {
        console.log(hero);
        await this.db.hero.upsert({
          create: {
            ...hero,
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
                  putToDeckResetedDefender:
                    action.putToDeckResetedDefender ?? 0,
                  putPurchasedCardIntoDeck:
                    action.putPurchasedCardIntoDeck ?? 0,
                })),
              },
            },
          },
          where: {
            name: hero.name,
          },
          update: {},
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
