-- CreateTable
CREATE TABLE "InpatientObservation" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "nurse_name" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "heart_rate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "resp_rate" INTEGER,
    "sats" INTEGER,
    "notes" TEXT,

    CONSTRAINT "InpatientObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationLog" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "prescription_item_id" INTEGER,
    "medicine_name" TEXT,
    "given_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "given_by" TEXT,
    "status" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "MedicationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InpatientObservation" ADD CONSTRAINT "InpatientObservation_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationLog" ADD CONSTRAINT "MedicationLog_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationLog" ADD CONSTRAINT "MedicationLog_prescription_item_id_fkey" FOREIGN KEY ("prescription_item_id") REFERENCES "PrescriptionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
