-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "dicom_url" TEXT,
ADD COLUMN     "radiation_dose" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PASample" (
    "id" SERIAL NOT NULL,
    "service_order_id" INTEGER NOT NULL,
    "sample_type" TEXT NOT NULL,
    "organ_source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "gross_desc" TEXT,
    "micro_desc" TEXT,
    "conclusion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PASample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PAWorkflow" (
    "id" SERIAL NOT NULL,
    "sample_id" INTEGER NOT NULL,
    "step" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PAWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodBag" (
    "id" SERIAL NOT NULL,
    "blood_type" TEXT NOT NULL,
    "rhesus" TEXT NOT NULL,
    "component_type" TEXT NOT NULL,
    "bag_number" TEXT NOT NULL,
    "donor_source" TEXT,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodCrossmatch" (
    "id" SERIAL NOT NULL,
    "bag_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "notes" TEXT,
    "performed_by" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodCrossmatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SterileSet" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'READY',
    "last_sterile_at" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),

    CONSTRAINT "SterileSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SterileCycle" (
    "id" SERIAL NOT NULL,
    "set_id" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "machine_id" TEXT,
    "operator" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SterileCycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PASample_service_order_id_key" ON "PASample"("service_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "BloodBag_bag_number_key" ON "BloodBag"("bag_number");

-- CreateIndex
CREATE UNIQUE INDEX "SterileSet_qr_code_key" ON "SterileSet"("qr_code");

-- AddForeignKey
ALTER TABLE "PASample" ADD CONSTRAINT "PASample_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "ServiceOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PAWorkflow" ADD CONSTRAINT "PAWorkflow_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "PASample"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodCrossmatch" ADD CONSTRAINT "BloodCrossmatch_bag_id_fkey" FOREIGN KEY ("bag_id") REFERENCES "BloodBag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodCrossmatch" ADD CONSTRAINT "BloodCrossmatch_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SterileCycle" ADD CONSTRAINT "SterileCycle_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "SterileSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
