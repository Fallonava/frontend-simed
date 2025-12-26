-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "created_by_id" INTEGER,
ADD COLUMN     "is_teaching_case" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'FINAL',
ADD COLUMN     "verified_by_id" INTEGER;

-- CreateTable
CREATE TABLE "LogbookEntry" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "activity_type" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "medical_record_id" INTEGER,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogbookEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalAssessment" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicalAssessment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClinicalAssessment" ADD CONSTRAINT "ClinicalAssessment_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
