import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import type { CreateBattlefieldDto } from '../controllers/dtos/create-battlefield.dto';

@Injectable()
export class BattlefieldService {
  private readonly db: PrismaClient;

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
    });

    return battlefield;
  }

  public async getBattleFileds() {
    const battlefields = await this.db.battlefield.findMany();

    return battlefields;
  }
}
