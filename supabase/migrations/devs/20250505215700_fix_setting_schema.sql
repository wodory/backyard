-- DropForeignKey
ALTER TABLE "public"."settings" DROP CONSTRAINT "settings_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."settings" DROP COLUMN "settings_data",
ADD COLUMN     "data" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

