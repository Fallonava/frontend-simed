/*
  Warnings:

  - You are about to drop the column `poli_name` on the `Doctor` table. All the data in the column will be lost.
  - Added the required column `poliklinik_id` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Poliklinik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "queue_code" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "specialist" TEXT NOT NULL,
    "photo_url" TEXT,
    "poliklinik_id" INTEGER NOT NULL,
    CONSTRAINT "Doctor_poliklinik_id_fkey" FOREIGN KEY ("poliklinik_id") REFERENCES "Poliklinik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Doctor" ("id", "name", "photo_url", "specialist") SELECT "id", "name", "photo_url", "specialist" FROM "Doctor";
DROP TABLE "Doctor";
ALTER TABLE "new_Doctor" RENAME TO "Doctor";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Poliklinik_queue_code_key" ON "Poliklinik"("queue_code");
