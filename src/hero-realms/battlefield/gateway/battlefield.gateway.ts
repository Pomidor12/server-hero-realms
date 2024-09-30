import { Injectable } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

import {
  CLIENT_MESSAGES,
  NAMESPACE,
  TRANSPORTS,
} from '../battlefield.constant';
import { BattlefieldService } from '../services/battlefield.service';
import { SocketService } from 'libs/socket/services/socket.service';

import type { PrepareBattlefieldDto } from '../services/battlefield.interface';

@WebSocketGateway({ transports: TRANSPORTS, namespace: NAMESPACE })
export class BattlefieldGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly battlefield: BattlefieldService,
    private readonly socket: SocketService,
  ) {}

  public handleConnection(client: Socket) {
    this.socket.onConnect(client);
  }

  public handleDisconnect(client: Socket) {
    this.socket.onDisconnect(client);
  }

  @SubscribeMessage(CLIENT_MESSAGES.PREPARE_BATTLEFIELD)
  public handlePrepareBattlefield(@MessageBody() dto: PrepareBattlefieldDto) {
    return this.battlefield.prepareBattlefield(dto.id);
  }
}
