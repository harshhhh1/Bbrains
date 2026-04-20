-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "notification"
ADD COLUMN "actor_id" TEXT,
ADD COLUMN "message_id" TEXT,
ADD COLUMN "channel_id" VARCHAR(120),
ADD COLUMN "entity_url" VARCHAR(255),
ADD COLUMN "read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "chat_messages"
ADD COLUMN "mentioned_user_ids" JSONB DEFAULT '[]';

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_created_at_idx" ON "push_subscriptions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notification_user_id_read_type_idx" ON "notification"("user_id", "read", "type");

-- CreateIndex
CREATE INDEX "notification_user_id_channel_id_read_idx" ON "notification"("user_id", "channel_id", "read");

-- CreateIndex
CREATE INDEX "chat_messages_chat_id_created_at_idx" ON "chat_messages"("chat_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "push_subscriptions"
ADD CONSTRAINT "push_subscriptions_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user"("user_id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification"
ADD CONSTRAINT "notification_actor_id_fkey"
FOREIGN KEY ("actor_id") REFERENCES "user"("user_id")
ON DELETE SET NULL ON UPDATE CASCADE;
