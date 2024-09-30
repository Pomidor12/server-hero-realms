import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  private conections = new Map<number, Socket>();

  public onConnect(client: Socket) {
    const { userId } = client.handshake.auth;
    if (userId) {
      this.conections.set(userId, client);
    }
  }

  public onDisconnect(client: Socket) {
    const { userId } = client.handshake.auth;
    this.conections.delete(userId);
  }

  public getConnection(userId: number) {
    return this.conections.get(userId);
  }

  public getAllConnections() {
    return [...this.conections.values()];
  }

  public notifyAllSubsribers(event: string, data: any) {
    for (const conection of this.getAllConnections()) {
      conection.emit(event, data);
    }
  }
}
