/*
  Warnings:

  - A unique constraint covering the columns `[booking_code]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Queue" ADD COLUMN     "booked_via" TEXT NOT NULL DEFAULT 'OFFLINE',
ADD COLUMN     "booking_code" TEXT,
ADD COLUMN     "check_in_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "tariff_id" INTEGER;

-- CreateTable
CREATE TABLE "Sep" (
    "id" SERIAL NOT NULL,
    "no_sep" TEXT NOT NULL,
    "tgl_sep" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "no_kartu" TEXT NOT NULL,
    "no_mr" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "medical_record_id" INTEGER,
    "jns_pelayanan" TEXT NOT NULL,
    "poli_tujuan" TEXT NOT NULL,
    "diagnosa_awal" TEXT NOT NULL,
    "catatan" TEXT,
    "is_coba" BOOLEAN NOT NULL DEFAULT false,
    "is_kll" BOOLEAN NOT NULL DEFAULT false,
    "is_suplesi" BOOLEAN NOT NULL DEFAULT false,
    "no_sep_suplesi" TEXT,
    "lp_manual" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FingerprintLog" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "check_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "device_id" TEXT,
    "status" TEXT NOT NULL,
    "verify_score" INTEGER,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "FingerprintLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskTimestamp" (
    "id" SERIAL NOT NULL,
    "queue_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "error_log" TEXT,

    CONSTRAINT "TaskTimestamp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTariff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "unit" TEXT,
    "code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTariff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sep_no_sep_key" ON "Sep"("no_sep");

-- CreateIndex
CREATE UNIQUE INDEX "Sep_medical_record_id_key" ON "Sep"("medical_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "TaskTimestamp_queue_id_task_id_key" ON "TaskTimestamp"("queue_id", "task_id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceTariff_code_key" ON "ServiceTariff"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Queue_booking_code_key" ON "Queue"("booking_code");

-- AddForeignKey
ALTER TABLE "Sep" ADD CONSTRAINT "Sep_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sep" ADD CONSTRAINT "Sep_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FingerprintLog" ADD CONSTRAINT "FingerprintLog_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskTimestamp" ADD CONSTRAINT "TaskTimestamp_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "Queue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceOrder" ADD CONSTRAINT "ServiceOrder_tariff_id_fkey" FOREIGN KEY ("tariff_id") REFERENCES "ServiceTariff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
