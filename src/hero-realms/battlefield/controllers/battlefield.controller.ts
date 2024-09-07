import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';

import { BattlefieldService } from '../services/battlefield.service';

import { CreateBattlefieldDto } from './dtos/create-battlefield.dto';

@Controller({ path: 'battlefield', version: '1' })
export class BattlefieldController {
  constructor(private readonly battlefield: BattlefieldService) {}

  @Post()
  public createBattlefield(@Body() dto: CreateBattlefieldDto) {
    return this.battlefield.createBattleField(dto);
  }

  @Get()
  public getBattlefield(@Param('id', ParseIntPipe) id: number) {
    return this.battlefield.getBattleFiled(id);
  }

  @Get('all-battlefields')
  public getBattlefields() {
    return this.battlefield.getBattleFileds();
  }
}
