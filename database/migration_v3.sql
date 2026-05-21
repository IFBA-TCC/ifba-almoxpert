-- AlmoxPert Migration v3 — Make variation_id nullable (support items without variations)
-- Run this script on an existing almoxpert database to upgrade it to v3.

USE almoxpert;

-- ── Drop FK constraints before modifying columns ─────────────────────────────
ALTER TABLE `shipment_items`
  DROP FOREIGN KEY IF EXISTS `fk_shipment_items_variation`;

ALTER TABLE `order_items`
  DROP FOREIGN KEY IF EXISTS `fk_order_items_variation`;

ALTER TABLE `stock_movements`
  DROP FOREIGN KEY IF EXISTS `fk_movements_variation`;

-- ── Make variation_id nullable ────────────────────────────────────────────────
ALTER TABLE `stock`
  MODIFY COLUMN `variation_id` BIGINT NULL;

ALTER TABLE `shipment_items`
  MODIFY COLUMN `variation_id` BIGINT NULL;

ALTER TABLE `order_items`
  MODIFY COLUMN `variation_id` BIGINT NULL;

ALTER TABLE `stock_movements`
  MODIFY COLUMN `variation_id` BIGINT NULL;

-- ── Re-add FK constraints (nullable columns allow NULL — no FK check for NULL) ─
ALTER TABLE `shipment_items`
  ADD CONSTRAINT `fk_shipment_items_variation`
    FOREIGN KEY (`variation_id`) REFERENCES `item_variations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_variation`
    FOREIGN KEY (`variation_id`) REFERENCES `item_variations` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_movements_variation`
    FOREIGN KEY (`variation_id`) REFERENCES `item_variations` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

SELECT 'Migration v3 applied successfully.' AS result;
