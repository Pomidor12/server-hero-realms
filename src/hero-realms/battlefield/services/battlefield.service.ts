import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import omit from 'lodash.omit';

import type { CreateBattlefieldDto } from '../controllers/dtos/create-battlefield.dto';
import { UpdateBattlefieldDto } from '../controllers/dtos/update-battlefield.dto';
import { HeroService } from 'src/hero-realms/hero/services/hero.service';
import { getRandomNumbers } from '../utils/math';
import { HERO_PLACEMENT } from 'src/hero-realms/hero/enums/hero-placement.enum';

@Injectable()
export class BattlefieldService {
  constructor(
    private readonly db: PrismaClient,
    private readonly hero: HeroService,
  ) {}

  public async createBattleField(dto: CreateBattlefieldDto) {
    const battlefield = await this.db.battlefield.create({
      data: {
        name: dto.name,
      },
    });

    return battlefield;
  }

  public async getBattleFiled(id: number) {
    const battlefield = await this.db.battlefield.findUnique({
      where: {
        id,
      },
      include: { heroes: true, players: true },
    });

    return battlefield;
  }

  public async getBattleFileds() {
    const battlefields = await this.db.battlefield.findMany({
      include: { heroes: true, players: true },
    });

    return battlefields;
  }

  public async updateBattleFiled(dto: UpdateBattlefieldDto) {
    const players = await this.db.player.findMany({
      where: {
        id: {
          in: dto.playersIds,
        },
      },
    });

    const heroes = await this.db.hero.findMany({
      where: {
        id: {
          in: dto.heroIds,
        },
      },
    });

    for (const player of players) {
      await this.db.battlefield.update({
        where: { id: dto.id },
        data: {
          players: {
            connect: {
              id: player.id,
            },
          },
        },
      });
    }

    const updatedPlayer = await this.db.battlefield.update({
      where: { id: dto.id },
      data: {
        name: dto.name,
        round: dto.round,
      },
      include: { players: true },
    });

    return updatedPlayer;
  }

  public async prepareBattlefield(id: number) {
    const battlefield = await this.db.battlefield.findUnique({
      where: { id },
      include: { players: true, heroes: { include: { actions: true } } },
    });

    if (!battlefield.heroes.length) {
      const heroes = await this.hero.getHeroes();

      const indexCardsForTraidingRow = getRandomNumbers(
        0,
        heroes.length - 1,
        6,
      );

      for (const [index, hero] of heroes.entries()) {
        const omittedHero = omit(hero, 'id');
        const res = await this.hero.createHero({
          ...omittedHero,
          battlefieldId: id,
          placement: indexCardsForTraidingRow.includes(index)
            ? HERO_PLACEMENT.TRADING_ROW
            : HERO_PLACEMENT.TRADING_DECK,
        });
        console.log(res);
      }
    }

    const normalizedBattlefield = {
      ...battlefield,
      heroes: battlefield.heroes.map((hero) => this.hero.normalizeHero(hero)),
    };

    return normalizedBattlefield;
  }
}
