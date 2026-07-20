/*
  Warnings:

  - You are about to drop the column `companyId` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `readTime` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the `_ExperienceToProjectHighlight` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `company` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `company_id` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_highlight_id` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `company_id` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ExperienceToProjectHighlight" DROP CONSTRAINT "_ExperienceToProjectHighlight_A_fkey";

-- DropForeignKey
ALTER TABLE "_ExperienceToProjectHighlight" DROP CONSTRAINT "_ExperienceToProjectHighlight_B_fkey";

-- DropForeignKey
ALTER TABLE "experiences" DROP CONSTRAINT "experiences_companyId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_companyId_fkey";

-- AlterTable
ALTER TABLE "experiences" DROP COLUMN "companyId",
ADD COLUMN     "company_id" INTEGER NOT NULL,
ADD COLUMN     "project_highlight_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "readTime",
ADD COLUMN     "read_time" INTEGER;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "companyId",
ADD COLUMN     "company_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_ExperienceToProjectHighlight";

-- DropTable
DROP TABLE "company";

-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "company_logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_project_highlight_id_fkey" FOREIGN KEY ("project_highlight_id") REFERENCES "project_highlights"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
