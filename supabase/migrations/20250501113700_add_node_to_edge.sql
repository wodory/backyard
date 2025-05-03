-- DropForeignKey (이전 컬럼에 대한 외래 키 제약 조건 삭제)
ALTER TABLE "public"."edges" DROP CONSTRAINT IF EXISTS "edges_source_card_id_fkey";
ALTER TABLE "public"."edges" DROP CONSTRAINT IF EXISTS "edges_target_card_id_fkey";

-- Drop old unique constraint and index
ALTER TABLE "public"."edges" DROP CONSTRAINT IF EXISTS "edges_project_source_target_unique";
DROP INDEX IF EXISTS "public"."edges_project_source_target_unique";

-- ######### 방법 B: 기존 엣지 데이터 삭제 #########
DELETE FROM "public"."edges";
-- ##############################################

-- AlterTable: Drop old columns and Add new NOT NULL columns
ALTER TABLE "public"."edges"
  DROP COLUMN IF EXISTS "source", -- IF EXISTS 추가 권장
  DROP COLUMN IF EXISTS "target", -- IF EXISTS 추가 권장
  ADD COLUMN "source_node_id" UUID NOT NULL,
  ADD COLUMN "target_node_id" UUID NOT NULL;

-- CreateIndex & Add new unique constraint
-- 참고: UNIQUE 제약 조건을 추가하면 인덱스는 보통 자동으로 생성됩니다.
-- CREATE UNIQUE INDEX "edges_project_source_node_target_node_unique" ON "public"."edges"("project_id", "source_node_id", "target_node_id");
ALTER TABLE "public"."edges" ADD CONSTRAINT "edges_project_source_node_target_node_unique" UNIQUE ("project_id", "source_node_id", "target_node_id");

-- AddForeignKey (새로운 컬럼에 대한 외래 키 제약 조건 추가)
ALTER TABLE "public"."edges" ADD CONSTRAINT "edges_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "public"."card_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."edges" ADD CONSTRAINT "edges_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "public"."card_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;