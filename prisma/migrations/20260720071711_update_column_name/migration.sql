/*
  Warnings:

  - You are about to drop the column `companyLogo` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `experiences` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `project_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `project_highlights` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `experiences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `posts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `project_highlights` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "companyLogo",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "company_logo" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "experiences" DROP COLUMN "createdAt",
DROP COLUMN "endDate",
DROP COLUMN "startDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "project_highlights" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
