-- CreateEnum
CREATE TYPE "action_condition" AS ENUM ('sacrifice', 'fraction', 'choice', 'for_every_defender', 'for_every_guardian', 'for_every_fraction');

-- CreateEnum
CREATE TYPE "hero_placement" AS ENUM ('active_deck', 'selection_deck', 'reset_deck', 'sacrificial_deck', 'trading_deck', 'trading_row');

-- CreateTable
CREATE TABLE "hero" (
    "id" SERIAL NOT NULL,
    "player_id" INTEGER,
    "battlefield_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "fraction" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "protection" INTEGER NOT NULL,
    "isGuardian" BOOLEAN NOT NULL,
    "placement" "hero_placement" NOT NULL,

    CONSTRAINT "hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action" (
    "hero_id" SERIAL NOT NULL,
    "conditions" "action_condition"[] DEFAULT ARRAY[]::"action_condition"[],
    "is_optional" BOOLEAN NOT NULL,
    "damage" INTEGER NOT NULL,
    "heal" INTEGER NOT NULL,
    "gold" INTEGER NOT NULL,
    "take_card" INTEGER NOT NULL,
    "reset_card" INTEGER NOT NULL,
    "reset_opponents_card" INTEGER NOT NULL,
    "stan_opponents_hero" INTEGER NOT NULL,
    "prepare_hero" INTEGER NOT NULL,
    "put_to_deck_reseted_card" INTEGER NOT NULL,
    "put_to_deck_reseted_defender" INTEGER NOT NULL,
    "put_purchased_card_into_deck" INTEGER NOT NULL,

    CONSTRAINT "action_pkey" PRIMARY KEY ("hero_id")
);

-- CreateTable
CREATE TABLE "player" (
    "id" SERIAL NOT NULL,
    "battlefield_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "health" INTEGER NOT NULL,
    "current_turn_player" BOOLEAN NOT NULL DEFAULT false,
    "turnOrder" INTEGER NOT NULL,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "battlefield" (
    "id" SERIAL NOT NULL,
    "round" INTEGER NOT NULL,

    CONSTRAINT "battlefield_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hero_name_key" ON "hero"("name");

-- AddForeignKey
ALTER TABLE "hero" ADD CONSTRAINT "hero_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero" ADD CONSTRAINT "hero_battlefield_id_fkey" FOREIGN KEY ("battlefield_id") REFERENCES "battlefield"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action" ADD CONSTRAINT "action_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "hero"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player" ADD CONSTRAINT "player_battlefield_id_fkey" FOREIGN KEY ("battlefield_id") REFERENCES "battlefield"("id") ON DELETE SET NULL ON UPDATE CASCADE;
