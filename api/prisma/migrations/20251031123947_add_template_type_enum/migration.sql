/*
  Warnings:

  - The `type` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('PROPOSAL', 'EMAIL');

-- AlterTable
ALTER TABLE "templates" DROP COLUMN "type",
ADD COLUMN     "type" "TemplateType" NOT NULL DEFAULT 'PROPOSAL';
