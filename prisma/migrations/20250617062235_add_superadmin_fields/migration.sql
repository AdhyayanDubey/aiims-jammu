/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to drop the `appointment` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `appointment`;

-- CreateTable
CREATE TABLE `appointments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `preferred_date` DATETIME(3) NOT NULL,
    `preferred_time` VARCHAR(191) NULL,
    `message` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `feedback` VARCHAR(191) NULL,
    `forwardedToSuperAdmin` BOOLEAN NOT NULL DEFAULT false,
    `superAdminStatus` ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMMENTED') NOT NULL DEFAULT 'PENDING',
    `superAdminFeedback` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
