-- CreateEnum
CREATE TYPE "report_status" AS ENUM ('PENDING', 'UPLOADING', 'PROCESSING', 'REVIEWING', 'GENERATING', 'COMPLETED', 'ERROR');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurators" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "pdf_fields" JSONB NOT NULL DEFAULT '[]',
    "excel_columns" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "configurator_id" UUID,
    "title" VARCHAR(300) NOT NULL,
    "status" "report_status" NOT NULL DEFAULT 'PENDING',
    "pdf_source_path" VARCHAR(1000),
    "excel_source_path" VARCHAR(1000),
    "pdf_original_name" VARCHAR(500),
    "excel_original_name" VARCHAR(500),
    "extracted_data" JSONB,
    "export_options" JSONB,
    "output_pdf_path" VARCHAR(1000),
    "output_file_name" VARCHAR(300),
    "ai_summary" TEXT,
    "error_message" TEXT,
    "generated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "configurators" ADD CONSTRAINT "configurators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_configurator_id_fkey" FOREIGN KEY ("configurator_id") REFERENCES "configurators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
