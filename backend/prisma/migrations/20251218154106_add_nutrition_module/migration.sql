-- CreateTable
CREATE TABLE "DietMenu" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER,

    CONSTRAINT "DietMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietOrder" (
    "id" SERIAL NOT NULL,
    "admission_id" INTEGER NOT NULL,
    "diet_menu_id" INTEGER NOT NULL,
    "extras" TEXT,
    "meal_time" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DietMenu_code_key" ON "DietMenu"("code");

-- AddForeignKey
ALTER TABLE "DietOrder" ADD CONSTRAINT "DietOrder_admission_id_fkey" FOREIGN KEY ("admission_id") REFERENCES "Admission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietOrder" ADD CONSTRAINT "DietOrder_diet_menu_id_fkey" FOREIGN KEY ("diet_menu_id") REFERENCES "DietMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
