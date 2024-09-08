export type UpdatePlayerDto = {
  id: number;
  name?: string;
  battlefieldId?: number;
  image?: string;
  health?: number;
  turnOrder?: number;
  currentTurnPlayer?: boolean;
};
