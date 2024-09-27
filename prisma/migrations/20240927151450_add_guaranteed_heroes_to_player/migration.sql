-- AlterTable
ALTER TABLE "player" ADD COLUMN     "guaranteed_heroes" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
