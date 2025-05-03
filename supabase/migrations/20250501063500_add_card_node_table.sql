-- CreateTable
CREATE TABLE "public"."card_nodes" (
    "id" UUID NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "cardId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "styleJson" JSONB,
    "dataJson" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_nodes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."card_nodes" ADD CONSTRAINT "card_nodes_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."card_nodes" ADD CONSTRAINT "card_nodes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

