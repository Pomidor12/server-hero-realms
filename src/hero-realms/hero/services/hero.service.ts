import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import { Hero, PrismaClient } from '@prisma/client';

import { CONVERT_ACTION_CONDITION } from '../enums/action-condition.enum';
import { DATASET_PATH_FILE } from './hero.constant';

import type { Dataset, HeroRaw, HeroStats } from './hero.interface';
import { CONVERT_HERO_PLACEMENT } from '../enums/hero-placement.enum';

@Injectable()
export class HeroService {
  constructor(private readonly db: PrismaClient) {}

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
