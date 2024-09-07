import { Action, Hero } from '@prisma/client';

export type Dataset = {
  heroes: HeroStats[];
};

type HeroStats = Omit<
  Hero,
  'id' | 'playerId' | 'battlefieldId' | 'placement' | 'protection'
> & { actions: OptionalHeroAction[]; protection?: number };

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
  | 'for_every_defender'
  | 'for_every_guardian'
  | 'for_every_fraction';
