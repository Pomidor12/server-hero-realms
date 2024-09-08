export type UpdateBattlefieldDto = {
  id: number;
  name?: string;
  round?: number;
  playersIds?: number[];
  heroIds?: number[];
};
