-- AlterTable
ALTER TABLE "public"."settings" DROP COLUMN "settings",
ADD COLUMN     "settings_data" JSONB NOT NULL DEFAULT '{}';

