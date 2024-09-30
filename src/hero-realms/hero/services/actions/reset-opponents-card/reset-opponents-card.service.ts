import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { HeroPlacement, PrismaClient } from '@prisma/client';

import { BattlefieldService } from 'src/hero-realms/battlefield/services/battlefield.service';
import { CLIENT_MESSAGES } from 'src/hero-realms/battlefield/battlefield.constant';
import { SocketService } from 'libs/socket/services/socket.service';

import { IAction, type UseActionDto } from '../action.interface';

@Injectable()
export class ResetOpponentsCardActionService extends IAction {
  constructor(
    private readonly db: PrismaClient,
    private readonly socket: SocketService,
    @Inject(forwardRef(() => BattlefieldService))
    private readonly battlefield: BattlefieldService,
  ) {
    super();
  }

  public async useAction(dto: UseActionDto) {
    const connection = this.socket.getConnection(dto.opponentPlayer.id);
    connection.emit(CLIENT_MESSAGES.NEED_TO_RESET_CARD);

    connection.on(CLIENT_MESSAGES.RESET_CARD, async (id: number) => {
      await this.db.hero.update({
        where: { id },
        data: { placement: HeroPlacement.RESET_DECK },
      });
      await this.battlefield.getBattlefieldAndNotifyAllSubs(
        CLIENT_MESSAGES.BATTLEFIELD_UPDATED,
        dto.player.battlefieldId,
      );
    });
  }
}
