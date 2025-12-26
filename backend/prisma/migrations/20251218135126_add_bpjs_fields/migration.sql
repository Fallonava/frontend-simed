/*
  Warnings:

  - You are about to drop the column `bpjs_no` on the `Patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bpjs_card_no]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "bpjs_no",
ADD COLUMN     "bpjs_card_no" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "is_bpjs" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_bpjs_card_no_key" ON "Patient"("bpjs_card_no");
