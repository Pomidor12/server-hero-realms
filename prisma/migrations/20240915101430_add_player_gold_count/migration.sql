/*
  Warnings:

  - You are about to drop the column `isGuardian` on the `hero` table. All the data in the column will be lost.
  - You are about to drop the column `turnOrder` on the `player` table. All the data in the column will be lost.
  - Added the required column `turn_order` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hero" DROP COLUMN "isGuardian",
ADD COLUMN     "is_guarfian" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "player" DROP COLUMN "turnOrder",
ADD COLUMN     "current_gold_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "turn_order" INTEGER NOT NULL;
