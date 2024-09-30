import { Action, Hero, Player } from '@prisma/client';

export type UseActionDto = {
  actionName: string;
  value: number;
  action: Action;
  defendersCount: number;
  guardiansCount: number;
  player: Player & { heroes: Hero[] };
  opponentPlayer: Player;
  fractionHeroes: Hero[];
  heroIdForAction: number;
  heroId: number;
};

export class IAction {
  public useAction(dto: UseActionDto) {}
}
