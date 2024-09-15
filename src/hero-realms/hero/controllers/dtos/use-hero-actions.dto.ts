import { ActionWithoutAdditionalInfo } from '../../services/hero.interface';

export type UseHeroActionsDto = {
  heroId: number;
  playerId: number;
  choiceAction?: keyof ActionWithoutAdditionalInfo;
  heroIdForAction?: number;
};
