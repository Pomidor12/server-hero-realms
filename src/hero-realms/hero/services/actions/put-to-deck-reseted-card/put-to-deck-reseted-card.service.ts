import { Injectable } from '@nestjs/common';
import { HeroPlacement, PrismaClient } from '@prisma/client';

import { IAction, UseActionDto } from '../action.interface';

@Injectable()
export class PutToDeckResetedCardActionService extends IAction {
  constructor(private readonly db: PrismaClient) {
    super();
  }

  public async useAction(dto: UseActionDto) {
    if (dto.heroIdForAction) {
      await this.db.hero.update({
        where: { id: dto.heroIdForAction },
        data: {
          placement: HeroPlacement.SELECTION_DECK,
        },
      });

      dto.player.guaranteedHeroes.push(dto.heroIdForAction);
      await this.db.player.update({
        where: { id: dto.player.id },
        data: { guaranteedHeroes: dto.player.guaranteedHeroes },
      });
    }
  }
}
