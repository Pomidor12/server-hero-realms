import { ActionWithoutAdditionalInfo } from '../../services/hero.interface';

export type UseHeroActionsDto = {
  heroId: number;
  playerId: number;
  choiceActionId?: number;
  heroIdForAction?: number;
};
