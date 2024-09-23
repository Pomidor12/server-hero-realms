-- AlterTable
ALTER TABLE "action" ADD COLUMN     "sacrifice_card" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "damage" SET DEFAULT 0,
ALTER COLUMN "heal" SET DEFAULT 0,
ALTER COLUMN "gold" SET DEFAULT 0,
ALTER COLUMN "take_card" SET DEFAULT 0,
ALTER COLUMN "reset_card" SET DEFAULT 0,
ALTER COLUMN "reset_opponents_card" SET DEFAULT 0,
ALTER COLUMN "stan_opponents_hero" SET DEFAULT 0,
ALTER COLUMN "prepare_hero" SET DEFAULT 0,
ALTER COLUMN "put_to_deck_reseted_card" SET DEFAULT 0,
ALTER COLUMN "put_to_deck_reseted_defender" SET DEFAULT 0,
ALTER COLUMN "put_purchased_card_into_deck" SET DEFAULT 0;
