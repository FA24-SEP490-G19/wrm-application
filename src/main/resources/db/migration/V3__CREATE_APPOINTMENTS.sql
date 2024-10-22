CREATE TABLE `appointments`
(
    `id`                 BIGINT      NOT NULL AUTO_INCREMENT,
    `customer_id`        BIGINT      NOT NULL,
    `sales_id`           BIGINT      NOT NULL,
    `warehouse_id`       BIGINT      NOT NULL,
    `appointment_date`   DATETIME    NOT NULL,
    `status`             VARCHAR(50) NULL DEFAULT 'PENDING',
    `is_deleted`         BOOLEAN     NULL DEFAULT FALSE,
    `created_date`       DATETIME    NOT NULL,
    `last_modified_date` DATETIME    NOT NULL,
    PRIMARY KEY (`id`)
);