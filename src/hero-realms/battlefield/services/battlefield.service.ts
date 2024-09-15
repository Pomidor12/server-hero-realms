import { Injectable } from '@nestjs/common';
import { Action, HeroPlacement, PrismaClient } from '@prisma/client';
import omit from 'lodash.omit';
import { Socket } from 'socket.io';

import type { CreateBattlefieldDto } from '../controllers/dtos/create-battlefield.dto';
import { UpdateBattlefieldDto } from '../controllers/dtos/update-battlefield.dto';
import { HeroService } from 'src/hero-realms/hero/services/hero.service';
import { getRandomNumber, getRandomNumbers } from '../../utils/math';
import { HERO_PLACEMENT } from 'src/hero-realms/hero/enums/hero-placement.enum';
import {
  BASE_HEROES,
  CLIENT_MESSAGES,
  MIN_BATTLEFIELD_PLAYERS_COUNT,
  TRADING_ROW_CARDS_COUNT,
} from '../battlefield.constant';
import { RawBattlefield } from './battlefield.interface';

@Injectable()
export class BattlefieldService {
  private conections = new Map<string, Socket>();

  constructor(
    private readonly db: PrismaClient,
    private readonly hero: HeroService,
  ) {}

  public handleConnect(client: Socket) {
    this.conections.set(client.id, client);
  }

  public handleDisconnect(client: Socket) {
    this.conections.delete(client.id);
  }

  public notifyAllSubsribers(event: string, data: any) {
    for (const conection of this.conections.values()) {
      conection.emit(event, data);
    }
  }

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
      include: {
        heroes: { include: { actions: true } },
        players: { include: { heroes: { include: { actions: true } } } },
      },
    });

    return this.normalizedBattlefield(battlefield);
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
    let battlefield = await this.getBattleFiled(id);

    if (battlefield.players.length < MIN_BATTLEFIELD_PLAYERS_COUNT) {
      return;
    }

    const heroes = await this.hero.getHeroes();

    if (!battlefield.heroes.length) {
      const heroesForTrade = heroes.filter((hero) => hero.price);

      const indexCardsForTraidingRow = getRandomNumbers(
        0,
        heroesForTrade.length - 1,
        TRADING_ROW_CARDS_COUNT,
      );

      for (const [index, hero] of heroesForTrade.entries()) {
        const omittedHero = omit(hero, 'id');
        await this.hero.createHero({
          ...omittedHero,
          battlefieldId: id,
          placement: indexCardsForTraidingRow.includes(index)
            ? HERO_PLACEMENT.TRADING_ROW
            : HERO_PLACEMENT.TRADING_DECK,
        });
      }
    }

    const filteredPlayers = battlefield.players.filter(
      (player) => !player.heroes.length,
    );

    if (filteredPlayers.length) {
      const randomPlayerIndex = getRandomNumber(1, 2) - 1;
      const playerToChangeTurnOrder = battlefield.players[randomPlayerIndex];

      await this.db.player.update({
        data: { currentTurnPlayer: true },
        where: { id: playerToChangeTurnOrder.id },
      });

      const baseHeroes = heroes.filter((hero) =>
        BASE_HEROES.includes(hero.name),
      );
      const cardForDuplicate = baseHeroes.find((hero) => hero.name === 'Ято');
      const duplicates = new Array(4).fill(cardForDuplicate);
      baseHeroes.push(...duplicates);

      for (const player of filteredPlayers) {
        const createdActiveHeroesActions: Action[] = [];
        const initialCountCards =
          playerToChangeTurnOrder.id === player.id ? 3 : 5;

        const indexCardsForActiveDeck = getRandomNumbers(
          0,
          baseHeroes.length - 1,
          initialCountCards,
        );

        for (const [index, hero] of baseHeroes.entries()) {
          const omittedHero = omit(hero, 'id');
          const isActiveHero = indexCardsForActiveDeck.includes(index);

          const newHero = await this.hero.createHero({
            ...omittedHero,
            battlefieldId: id,
            playerId: player.id,
            placement: isActiveHero
              ? HERO_PLACEMENT.ACTIVE_DECK
              : HERO_PLACEMENT.SELECTION_DECK,
          });
          if (isActiveHero) {
            createdActiveHeroesActions.push(...newHero.actions);
          }
        }
      }
    }

    if (!battlefield.heroes.length) {
      battlefield = await this.getBattleFiled(id);
    }

    this.notifyAllSubsribers(CLIENT_MESSAGES.BATTLEFIELD_UPDATED, battlefield);
  }

  public async getBattlefieldAndNotifyAllSubs(event: string, id: number) {
    const battlefield = await this.db.battlefield.findUnique({
      where: { id },
      include: {
        players: { include: { heroes: { include: { actions: true } } } },
        heroes: { include: { actions: true } },
      },
    });

    this.notifyAllSubsribers(event, this.normalizedBattlefield(battlefield));
  }

  private normalizedBattlefield(battlefield: RawBattlefield) {
    const normalizedBattlefield = {
      ...battlefield,
      heroes:
        battlefield.heroes?.map((hero) => this.hero.normalizeHero(hero)) ?? [],
      players: battlefield.players?.map((player) => ({
        ...player,
        heroes: player.heroes.map((hero) => this.hero.normalizeHero(hero)),
      })),
    };

    return normalizedBattlefield;
  }
}
