import { type Hero, HeroPlacement } from '@prisma/client';

import { ACTION_TYPE } from '../services/hero.constant';

export const getHeroesInfo = (playerHeroes: Hero[], usedHero: Hero) => {
  const fractionHeroes = playerHeroes.filter(
    ({ id, fraction, placement }) =>
      id !== usedHero.id &&
      fraction === usedHero.fraction &&
      (placement === HeroPlacement.ACTIVE_DECK ||
        placement === HeroPlacement.DEFENDERS_ROW),
  );

  const defendersCount = playerHeroes.reduce(
    (sum, hero) =>
      hero.placement === HeroPlacement.ACTIVE_DECK ||
      hero.placement === HeroPlacement.DEFENDERS_ROW
        ? sum + (hero.protection ? 1 : 0)
        : sum + 0,
    0,
  );

  const guardiansCount = playerHeroes.reduce(
    (sum, hero) =>
      hero.placement === HeroPlacement.ACTIVE_DECK ||
      hero.placement === HeroPlacement.DEFENDERS_ROW
        ? sum + (hero.isGuardian ? 1 : 0)
        : sum + 0,
    0,
  );

  return {
    fractionHeroes,
    defendersCount,
    guardiansCount,
  };
};

export const getPlacementForUsedAction = (action: string) => {
  switch (action) {
    case ACTION_TYPE.STAN_OPPONENTS_HERO:
    case ACTION_TYPE.RESET_CARD: {
      return HeroPlacement.RESET_DECK;
    }

    case ACTION_TYPE.SACRIFICE_CARD: {
      return HeroPlacement.SACRIFICIAL_DECK;
    }

    case ACTION_TYPE.PREPARE_HERO: {
      return HeroPlacement.DEFENDERS_ROW;
    }

    default: {
      return '';
    }
  }
};
