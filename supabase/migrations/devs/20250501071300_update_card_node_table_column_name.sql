-- DropForeignKey
ALTER TABLE "public"."card_nodes" DROP CONSTRAINT "card_nodes_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."card_nodes" DROP CONSTRAINT "card_nodes_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."card_nodes" DROP COLUMN "cardId",
DROP COLUMN "dataJson",
DROP COLUMN "positionX",
DROP COLUMN "positionY",
DROP COLUMN "projectId",
DROP COLUMN "styleJson",
ADD COLUMN     "card_id" UUID NOT NULL,
ADD COLUMN     "data_json" JSONB,
ADD COLUMN     "position_x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "position_y" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "project_id" UUID NOT NULL,
ADD COLUMN     "style_json" JSONB;

-- AddForeignKey
ALTER TABLE "public"."card_nodes" ADD CONSTRAINT "card_nodes_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_nodes" ADD CONSTRAINT "card_nodes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

