-- AlmoxPert Database Schema v2 — with size support

CREATE DATABASE IF NOT EXISTS almoxpert;
USE almoxpert;

-- ============================================
-- USER TABLES
-- ============================================

CREATE TABLE `users` (
  `id` BIGINT AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `user_type` ENUM('admin', 'student') NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_user_type` (`user_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `students` (
  `id` BIGINT AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `registration_number` VARCHAR(50) UNIQUE,
  `course` VARCHAR(100),
  `social_programs` VARCHAR(255),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE INDEX `idx_registration` (`registration_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `administrators` (
  `id` BIGINT AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `position` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INVENTORY TABLES
-- ============================================

CREATE TABLE `items` (
  `id` BIGINT AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` VARCHAR(50),
  `unit_of_measure` VARCHAR(50) NOT NULL,
  `has_variations` BOOLEAN DEFAULT FALSE,
  `size_type` ENUM('none', 'clothing', 'shoes') NOT NULL DEFAULT 'none',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_name` (`name`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `item_variations` (
  `id` BIGINT AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `description` VARCHAR(50) NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- stock uniqueness: one entry per (item, variation, size)
CREATE TABLE `stock` (
  `id` BIGINT AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `variation_id` BIGINT NULL,
  `size` VARCHAR(20) NOT NULL DEFAULT 'none',
  `available_quantity` INTEGER NOT NULL DEFAULT 0,
  `minimum_quantity` INTEGER DEFAULT 10,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  UNIQUE INDEX `idx_item_variation_size` (`item_id`, `variation_id`, `size`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SHIPMENT TABLES
-- ============================================

CREATE TABLE `shipments` (
  `id` BIGINT AUTO_INCREMENT,
  `shipment_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `responsible_id` BIGINT NOT NULL,
  `notes` TEXT,
  `status` ENUM('open', 'completed', 'cancelled') DEFAULT 'open',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_responsible` (`responsible_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `shipment_items` (
  `id` BIGINT AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `variation_id` BIGINT NULL,
  `size` VARCHAR(20) NOT NULL DEFAULT 'none',
  `shipment_id` BIGINT NOT NULL,
  `quantity` INTEGER NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_shipment` (`shipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK MOVEMENT TABLES
-- ============================================

CREATE TABLE `stock_movements` (
  `id` BIGINT AUTO_INCREMENT,
  `item_id` BIGINT NOT NULL,
  `variation_id` BIGINT NULL,
  `size` VARCHAR(20) NOT NULL DEFAULT 'none',
  `movement_type` ENUM('in', 'out') NOT NULL,
  `quantity` INTEGER NOT NULL,
  `movement_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `origin_type` ENUM('shipment', 'order') NOT NULL,
  `origin_id` BIGINT NOT NULL,
  `notes` TEXT,
  PRIMARY KEY(`id`),
  INDEX `idx_item_variation` (`item_id`, `variation_id`),
  INDEX `idx_date` (`movement_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDER TABLES
-- ============================================

CREATE TABLE `orders` (
  `id` BIGINT AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `order_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'approved', 'rejected', 'delivered') DEFAULT 'pending',
  `admin_notes` TEXT,
  `approval_date` DATETIME NULL,
  `approved_by` BIGINT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `order_items` (
  `id` BIGINT AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `item_id` BIGINT NOT NULL,
  `variation_id` BIGINT NULL,
  `size` VARCHAR(20) NOT NULL DEFAULT 'none',
  `requested_quantity` INTEGER NOT NULL,
  `approved_quantity` INTEGER NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(`id`),
  INDEX `idx_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FOREIGN KEYS
-- ============================================

ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_user`
  FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `administrators`
  ADD CONSTRAINT `fk_administrators_user`
  FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `item_variations`
  ADD CONSTRAINT `fk_variations_item`
  FOREIGN KEY(`item_id`) REFERENCES `items`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_item`
  FOREIGN KEY(`item_id`) REFERENCES `items`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stock_variation`
  FOREIGN KEY(`variation_id`) REFERENCES `item_variations`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `shipments`
  ADD CONSTRAINT `fk_shipments_user`
  FOREIGN KEY(`responsible_id`) REFERENCES `users`(`id`)
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `shipment_items`
  ADD CONSTRAINT `fk_shipment_items_shipment`
  FOREIGN KEY(`shipment_id`) REFERENCES `shipments`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_shipment_items_item`
  FOREIGN KEY(`item_id`) REFERENCES `items`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_shipment_items_variation`
  FOREIGN KEY(`variation_id`) REFERENCES `item_variations`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_movements_item`
  FOREIGN KEY(`item_id`) REFERENCES `items`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_movements_variation`
  FOREIGN KEY(`variation_id`) REFERENCES `item_variations`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user`
  FOREIGN KEY(`user_id`) REFERENCES `users`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_orders_approver`
  FOREIGN KEY(`approved_by`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order`
  FOREIGN KEY(`order_id`) REFERENCES `orders`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_item`
  FOREIGN KEY(`item_id`) REFERENCES `items`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_variation`
  FOREIGN KEY(`variation_id`) REFERENCES `item_variations`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Default admin user (password: admin123)
INSERT INTO `users` (`name`, `email`, `password_hash`, `user_type`) VALUES
('System Administrator', 'admin@ifba.edu.br', '$2b$10$8K1p3hf4QJmx2N0VDxBxD.Ey5jGpGQRD3N8f0VqL1KjP9hX7fM2V6', 'admin');

INSERT INTO `administrators` (`user_id`, `position`) VALUES
(1, 'System Administrator');

-- Sample items
INSERT INTO `items` (`name`, `type`, `unit_of_measure`, `has_variations`, `size_type`) VALUES
('Notebook',  'School Supply', 'unit', TRUE,  'none'),
('Pen',       'School Supply', 'unit', TRUE,  'none'),
('Pencil',    'School Supply', 'unit', TRUE,  'none'),
('Eraser',    'School Supply', 'unit', FALSE, 'none'),
('Ruler',     'School Supply', 'unit', TRUE,  'none'),
('Camiseta',  'Uniforme',      'unit', FALSE, 'clothing'),
('Tênis',     'Uniforme',      'pair', FALSE, 'shoes');

-- Item variations
INSERT INTO `item_variations` (`item_id`, `description`) VALUES
(1, '100 pages'), (1, '200 pages'),
(2, 'Blue'), (2, 'Black'), (2, 'Red'),
(3, 'HB'), (3, '2B'),
(4, 'White'),
(5, '30cm'), (5, '20cm'),
(6, 'Azul'),
(7, 'Preto');

-- Initial stock (items 1-5 have size='none'; items 6-7 have clothing/shoes sizes)
INSERT INTO `stock` (`item_id`, `variation_id`, `size`, `available_quantity`, `minimum_quantity`) VALUES
(1, 1,  'none', 50, 10), (1, 2,  'none', 30, 10),
(2, 3,  'none', 100, 20), (2, 4, 'none', 150, 20), (2, 5, 'none', 75, 20),
(3, 6,  'none', 200, 50), (3, 7, 'none', 100, 50),
(4, 8,  'none', 80, 15),
(5, 9,  'none', 40, 10), (5, 10, 'none', 60, 10),
(6, 11, 'PP',   20, 5),  (6, 11, 'P', 30, 5),  (6, 11, 'M', 40, 5),
(6, 11, 'G',    25, 5),  (6, 11, 'GG', 15, 5), (6, 11, 'GGG', 10, 5),
(7, 12, '38',   15, 3),  (7, 12, '39', 20, 3), (7, 12, '40', 25, 3),
(7, 12, '41',   20, 3),  (7, 12, '42', 15, 3);
