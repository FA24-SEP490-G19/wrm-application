CREATE TABLE `warehouses`
(
    `id`                   BIGINT       NOT NULL AUTO_INCREMENT,
    `name`                 VARCHAR(255) NOT NULL UNIQUE,
    `address`              VARCHAR(255) NOT NULL,
    `size`                 FLOAT(10, 2) NOT NULL,
    `status`               VARCHAR(50)  NULL DEFAULT 'ACTIVE',
    `description`          LONGTEXT     NULL,
    `warehouse_manager_id` BIGINT       NOT NULL,
    `is_deleted`           BOOLEAN      NULL DEFAULT FALSE,
    `created_date`         DATETIME     NOT NULL,
    `last_modified_date`   DATETIME     NOT NULL,
    PRIMARY KEY (`id`)
);