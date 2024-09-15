import { Action, Hero } from '@prisma/client';

export type Dataset = {
  heroes: HeroStats[];
};

export type HeroStats = Omit<
  Hero,
  'id' | 'playerId' | 'battlefieldId' | 'placement' | 'protection'
> & {
  actions: OptionalHeroAction[];
  protection?: number;
  battlefieldId?: number;
  playerId?: number;
  placement?: HeroPlacement;
};

type OptionalHeroAction = Partial<
  Omit<Action, 'heroId' | 'conditions' | 'isOptional'>
> & {
  conditions: ActionCondition[];
  isOptional: boolean;
};

export type ActionCondition =
  | 'sacrifice'
  | 'fraction'
  | 'choice'
  | 'for-every-defender'
  | 'for-every-guardian'
  | 'for-every-fraction';

export type HeroPlacement =
  | 'active-deck'
  | 'selection-deck'
  | 'reset-deck'
  | 'sacrificial-deck'
  | 'trading-deck'
  | 'trading-row'
  | 'defenders-row';

export type HeroRaw = Hero & { actions: Action[] };

export type ActionWithoutAdditionalInfo = Omit<
  Action,
  'id' | 'playerId' | 'heroId' | 'conditions' | 'isOptional' | 'isUsed'
>;
