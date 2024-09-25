export const DATASET_PATH_FILE = 'assets/dataset/heroes.json';

export const ACTION_TYPE = {
  DAMAGE: 'damage',
  GOLD: 'gold',
  HEAL: 'heal',
  TAKE_CARD: 'takeCard',
  SACRIFICE_CARD: 'sacrificeCard',
  RESET_CARD: 'resetCard',
  RESET_OPPONENTS_CARD: 'resetOpponentsCard',
  STAN_OPPONENTS_HERO: 'stanOpponentsHero',
  PREPARE_HERO: 'prepareHero',
  PUT_TO_DECK_RESETED_CARD: 'putToDeckResetedCard',
  PUT_TO_DECK_RESETED_HEO: 'putToDeckResetedDefender',
  PUT_PURCHASED_CARD_INTO_DECK: 'putPurchasedCardIntoDeck',
} as const;

export const ADDITIONAL_ACTION_INFO = [
  'id',
  'playerId',
  'heroId',
  'conditions',
  'isOptional',
  'isUsed',
] as const;
