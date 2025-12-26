-- CreateTable
CREATE TABLE "UsedImplant" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "medical_record_id" INTEGER,
    "admission_id" INTEGER,
    "item_name" TEXT NOT NULL,
    "sku" TEXT,
    "batch_no" TEXT,
    "serial_no" TEXT,
    "price" DECIMAL(10,2),
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surgeon_name" TEXT,
    "is_billed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsedImplant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsedImplant" ADD CONSTRAINT "UsedImplant_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedImplant" ADD CONSTRAINT "UsedImplant_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedImplant" ADD CONSTRAINT "UsedImplant_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "Admission"("id") ON DELETE SET NULL ON UPDATE CASCADE;
