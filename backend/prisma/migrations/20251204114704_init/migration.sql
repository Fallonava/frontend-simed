-- CreateTable
CREATE TABLE "Doctor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "specialist" TEXT NOT NULL,
    "photo_url" TEXT,
    "poli_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DailyQuota" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "doctor_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "max_quota" INTEGER NOT NULL,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    CONSTRAINT "DailyQuota_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "daily_quota_id" INTEGER NOT NULL,
    "queue_number" INTEGER NOT NULL,
    "queue_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Queue_daily_quota_id_fkey" FOREIGN KEY ("daily_quota_id") REFERENCES "DailyQuota" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyQuota_doctor_id_date_key" ON "DailyQuota"("doctor_id", "date");
