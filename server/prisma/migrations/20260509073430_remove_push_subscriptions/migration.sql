/*
  Warnings:

  - You are about to drop the `push_subscriptions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "push_subscriptions" DROP CONSTRAINT "push_subscriptions_user_id_fkey";

-- DropTable
DROP TABLE "push_subscriptions";
