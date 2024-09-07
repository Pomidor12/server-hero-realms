-- AlterTable
ALTER TABLE "action" DROP CONSTRAINT "action_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "hero_id" DROP DEFAULT,
ADD CONSTRAINT "action_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "action_hero_id_seq";

-- AlterTable
ALTER TABLE "battlefield" ADD COLUMN     "name" VARCHAR(255) NOT NULL,
ALTER COLUMN "round" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "hero" ALTER COLUMN "protection" DROP NOT NULL,
ALTER COLUMN "isGuardian" SET DEFAULT false,
ALTER COLUMN "placement" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "player_name_key" ON "player"("name");
