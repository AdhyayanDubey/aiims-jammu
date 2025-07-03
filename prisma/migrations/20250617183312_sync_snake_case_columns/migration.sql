/*
  Warnings:

  - You are about to drop the column `forwardedToSuperAdmin` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `superAdminFeedback` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `superAdminStatus` on the `appointments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `appointments` DROP COLUMN `forwardedToSuperAdmin`,
    DROP COLUMN `superAdminFeedback`,
    DROP COLUMN `superAdminStatus`,
    ADD COLUMN `forwarded_to_super_admin` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `super_admin_feedback` VARCHAR(191) NULL,
    ADD COLUMN `super_admin_status` VARCHAR(191) NULL;
