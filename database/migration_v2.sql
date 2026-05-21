-- AlmoxPert Migration v2 — Add size support
-- Run this script on an existing almoxpert database to upgrade it to v2.

USE almoxpert;

-- ── items: add size_type ──────────────────────────────────────────────────────
ALTER TABLE `items`
  ADD COLUMN `size_type` ENUM('none', 'clothing', 'shoes') NOT NULL DEFAULT 'none'
  AFTER `has_variations`;

-- ── stock: add size column + rebuild unique index ─────────────────────────────
ALTER TABLE `stock`
  ADD COLUMN `size` VARCHAR(20) NOT NULL DEFAULT 'none'
  AFTER `variation_id`;

ALTER TABLE `stock`
  DROP INDEX `idx_item_variation`;

ALTER TABLE `stock`
  ADD UNIQUE INDEX `idx_item_variation_size` (`item_id`, `variation_id`, `size`);

-- ── shipment_items: add size ──────────────────────────────────────────────────
ALTER TABLE `shipment_items`
  ADD COLUMN `size` VARCHAR(20) NOT NULL DEFAULT 'none'
  AFTER `variation_id`;

-- ── order_items: add size ─────────────────────────────────────────────────────
ALTER TABLE `order_items`
  ADD COLUMN `size` VARCHAR(20) NOT NULL DEFAULT 'none'
  AFTER `variation_id`;

-- ── stock_movements: add size ─────────────────────────────────────────────────
ALTER TABLE `stock_movements`
  ADD COLUMN `size` VARCHAR(20) NOT NULL DEFAULT 'none'
  AFTER `variation_id`;

SELECT 'Migration v2 applied successfully.' AS result;
