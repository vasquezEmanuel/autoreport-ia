/*
  Warnings:

  - You are about to drop the column `excel_original_name` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `excel_source_path` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `extracted_data` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `output_file_name` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `output_pdf_path` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `pdf_original_name` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `pdf_source_path` on the `reports` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `reports` table. All the data in the column will be lost.
  - Added the required column `name` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "upload_type" AS ENUM ('PDF', 'EXCEL');

-- AlterTable
ALTER TABLE "reports" DROP COLUMN "excel_original_name",
DROP COLUMN "excel_source_path",
DROP COLUMN "extracted_data",
DROP COLUMN "output_file_name",
DROP COLUMN "output_pdf_path",
DROP COLUMN "pdf_original_name",
DROP COLUMN "pdf_source_path",
DROP COLUMN "title",
ADD COLUMN     "excel_upload_id" UUID,
ADD COLUMN     "extracted_fields" JSONB,
ADD COLUMN     "name" VARCHAR(300) NOT NULL,
ADD COLUMN     "output_url" VARCHAR(1000),
ADD COLUMN     "pdf_upload_id" UUID;

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "file_name" VARCHAR(500) NOT NULL,
    "stored_path" VARCHAR(1000) NOT NULL,
    "file_type" "upload_type" NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_pdf_upload_id_fkey" FOREIGN KEY ("pdf_upload_id") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_excel_upload_id_fkey" FOREIGN KEY ("excel_upload_id") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
