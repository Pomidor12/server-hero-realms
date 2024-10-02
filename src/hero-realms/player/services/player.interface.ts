import { Hero, Player } from '@prisma/client';

export type PlayerWithHeroesRaw = Player & { heroes: Hero[] };
