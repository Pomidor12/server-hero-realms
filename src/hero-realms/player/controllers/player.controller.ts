import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';

import type { CreatePlayerDto } from './dtos/create-Player.dto';
import { PlayerService } from '../services/player.service';
import { UpdatePlayerDto } from './dtos/update-player.dto';

@Controller({ path: 'player', version: '1' })
export class PlayerController {
  constructor(private readonly player: PlayerService) {}

  @Post()
  public createPlayer(@Body() dto: CreatePlayerDto) {
    return this.player.createPlayer(dto);
  }

  @Get('all-players')
  public getPlayers() {
    return this.player.getPlayers();
  }

  @Put()
  public updatePlayer(@Body() dto: UpdatePlayerDto) {
    return this.player.updatePlayer(dto);
  }

  @Put('end-move/:id')
  public endPlayerMove(@Param('id', ParseIntPipe) id: number) {
    return this.player.endPlayerMove(id);
  }
}
